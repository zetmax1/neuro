import { Target, AlertTriangle } from "lucide-react";

interface LearnerContextBannerProps {
  currentTopic: string;
  learnerLevel: string;
  weaknesses?: string[];
}

export const LearnerContextBanner = ({ 
  currentTopic, 
  learnerLevel,
  weaknesses = []
}: LearnerContextBannerProps) => {
  const levelColors = {
    beginner: "text-success",
    intermediate: "text-warning",
    advanced: "text-primary",
  };

  const levelColor = levelColors[learnerLevel as keyof typeof levelColors] || levelColors.intermediate;

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Target className="w-4 h-4 text-primary" />
          {currentTopic}
        </div>
        <span className="text-muted-foreground/30">•</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${levelColor}`}>
          {learnerLevel} learner
        </span>
      </div>
      
      {weaknesses.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Focusing on: {weaknesses.join(", ")}</span>
        </div>
      )}
    </div>
  );
};
