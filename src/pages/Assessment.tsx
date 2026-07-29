import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { getAssessmentTests, AssessmentTest } from "@/api/assessment.api";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ArrowRight, 
  Lock,
  Loader2,
  RefreshCw,
  Filter,
  CheckCircle2
} from "lucide-react";

type FilterTab = "all" | "easy" | "medium" | "hard";

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<AssessmentTest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAssessmentTests();
      setTests(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load assessment tests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "hard":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    }
  };

  // Filter tests based on search and selected difficulty tab
  const filteredTests = tests.filter((test) => {
    const matchesSearch = 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.parent_name && test.parent_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "easy") return test.difficulty_level.toLowerCase() === "easy";
    if (activeTab === "medium") return test.difficulty_level.toLowerCase() === "medium";
    if (activeTab === "hard") return test.difficulty_level.toLowerCase() === "hard";

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Page Header (Clean Light Card) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-2xs">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Assessment Center
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Evaluate your topic mastery with adaptive test assessments. Questions dynamically match your knowledge level for accurate skill evaluation.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-medium text-slate-500 border-t border-slate-100">
              <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-md">{tests.length} Available Modules</span>
              <span>•</span>
              <span>Stratified Questions</span>
              <span>•</span>
              <span>Continuous Mastery Tracking</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tests by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Tests" },
                { id: "easy", label: "Easy" },
                { id: "medium", label: "Medium" },
                { id: "hard", label: "Hard" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Directory */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <Loader2 className="w-8 h-8 text-slate-700 animate-spin mb-3" />
            <p className="text-slate-500 font-medium text-xs">Loading assessment modules...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-2xs">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Failed to load tests</h3>
            <p className="text-slate-500 text-xs mb-4">{error}</p>
            <Button onClick={fetchTests} variant="outline" className="gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-2xs">
            <Filter className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No assessment tests found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
              Try adjusting your search term or filter selection.
            </p>
            <Button onClick={() => { setSearchQuery(""); setActiveTab("all"); }} variant="outline" className="text-xs">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      {test.parent_name || "Curriculum"}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${getDifficultyBadge(test.difficulty_level)}`}>
                      {test.difficulty_level}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                      {test.name}
                    </h2>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {test.description || "Adaptive test assessment covering topic material."}
                    </p>
                  </div>

                  {/* Info Pill Badges */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <strong>{test.question_count}</strong> Questions
                    </span>
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <strong>~{test.estimated_minutes}</strong> mins
                    </span>
                  </div>

                  {/* Mastery Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Mastery Score</span>
                      <span className="font-bold text-slate-900">{test.mastery_percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          test.mastery_percentage >= 70
                            ? "bg-emerald-500"
                            : test.mastery_percentage > 0
                            ? "bg-indigo-600"
                            : "bg-slate-300"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, test.mastery_percentage))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  {test.mastery_percentage >= 70 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">
                      {test.question_count > 0 ? "Ready to start" : "No questions"}
                    </span>
                  )}

                  {test.is_unlocked ? (
                    <Button
                      onClick={() => navigate(`/topic/${test.id}/assessment`)}
                      size="sm"
                      className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs"
                    >
                      {test.mastery_percentage > 0 ? "Retake" : "Start Test"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button disabled size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Assessment;
