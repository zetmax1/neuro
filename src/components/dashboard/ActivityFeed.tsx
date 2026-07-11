import React from 'react';
import { RecentActivity } from '@/api/analytics.api';
import { CheckCircle2, XCircle, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: RecentActivity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-border p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
           <Activity className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No Activity Yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
           Start completing assessments and studying topics to see your learning journey tracked here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-5 border-b border-border/50 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
           <Activity className="w-4 h-4 text-primary" />
           Recent Activity
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-white px-2.5 py-1 rounded-full border border-border/50 shadow-sm">
           Last 7 days
        </span>
      </div>
      
      <div className="divide-y divide-border/50">
        {activities.map((activity) => {
           const isCorrect = activity.is_correct === true;
           const isIncorrect = activity.is_correct === false;
           
           return (
            <div key={activity.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isIncorrect ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Activity className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                     {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">
                     {activity.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-2 sm:mt-0 ml-9 sm:ml-0">
                {activity.score !== undefined && (
                  <span className={`text-sm font-bold mb-1 px-2 py-0.5 rounded ${
                     activity.score >= 80 ? 'bg-green-100 text-green-700' :
                     activity.score >= 50 ? 'bg-orange-100 text-orange-700' :
                     'bg-red-100 text-red-700'
                  }`}>
                     {activity.score}%
                  </span>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
