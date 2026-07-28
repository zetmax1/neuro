import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Brain, 
  Loader2, 
  TrendingUp, 
  Gauge, 
  HelpCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import apiClient from '@/api/client';
import { cn } from '@/lib/utils';

interface MasteryTrendItem {
  attempt_number: number;
  timestamp: string;
  mastery_probability: number;
  mastery_pct: number;
  algorithm_used: string;
}

interface RecentItem {
  question_id: number;
  irt_difficulty: number;
  was_correct: boolean;
  theta_at_time: number;
  answered_at: string;
}

interface DiagnosticsData {
  topic_id: number;
  topic_name: string;
  mastery_trend: MasteryTrendItem[];
  current_theta: number;
  avg_recent_difficulty: number;
  recent_items: RecentItem[];
}

interface DiagnosticsPanelProps {
  topicId: number;
  className?: string;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ topicId, className }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isExpanded || data !== null) return;

    const fetchDiagnostics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/analytics/topic/${topicId}/diagnostics/`);
        setData(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load diagnostic analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnostics();
  }, [isExpanded, topicId, data]);

  // Format theta display values
  const currentTheta = data?.current_theta ?? 0.0;
  const avgDifficulty = data?.avg_recent_difficulty ?? 0.0;
  const delta = Math.abs(avgDifficulty - currentTheta);

  return (
    <div className={cn("bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm transition-all duration-300", className)}>
      {/* Collapsed Header / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                How is this calculated?
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
                BKT + IRT Proof
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect your adaptive Bayesian mastery curve & item response theory estimates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Content Drawer */}
      {isExpanded && (
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/40 space-y-6 animate-in fade-in duration-300">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-semibold">Loading Bayesian & IRT diagnostic state...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 text-center font-medium">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* 1. Line Chart: Bayesian Mastery Trend */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.mastery_trend}>
                    <XAxis dataKey="attempt_number" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                    <Line type="monotone" dataKey="mastery_probability" stroke="#4f46e5" 
                          strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 mt-1">
                  Bayesian mastery estimate after each attempt
                </p>
              </div>

              {/* 2. Visual Indicator: IRT Theta vs Item Difficulty */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2PL IRT Ability Matcher
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    2PL Stochastic Update
                  </span>
                </div>

                {/* Comparison Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      User Latent Ability (θ)
                    </span>
                    <div className="text-xl font-extrabold text-emerald-900">
                      {currentTheta > 0 ? `+${currentTheta.toFixed(3)}` : currentTheta.toFixed(3)}
                    </div>
                    <p className="text-[11px] text-emerald-600">Continuous 2PL student theta</p>
                  </div>

                  <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Avg Item Difficulty (b)
                    </span>
                    <div className="text-xl font-extrabold text-indigo-900">
                      {avgDifficulty > 0 ? `+${avgDifficulty.toFixed(3)}` : avgDifficulty.toFixed(3)}
                    </div>
                    <p className="text-[11px] text-indigo-600">Recent question target calibration</p>
                  </div>
                </div>

                {/* Relative Distance Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Ability Offset |b - θ|</span>
                    <span className="font-bold text-indigo-600">{delta.toFixed(3)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(10, (1 - delta / 3) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Exact Required Caption Line 2 */}
                <p className="text-xs text-slate-500 font-medium italic pt-1 border-t border-slate-100">
                  Your estimated ability level compared to recent question difficulty
                </p>
              </div>

            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
