import { Sparkles, Target, AlertTriangle } from "lucide-react";

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
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-warning/10 text-warning border-warning/20",
    advanced: "bg-primary/10 text-primary border-primary/20",
  };

  const levelColor = levelColors[learnerLevel as keyof typeof levelColors] || levelColors.intermediate;

  return (
    <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              Currently studying: {currentTopic}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColor}`}>
              {learnerLevel}
            </span>
          </div>
          
          {weaknesses.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-warning">
              <AlertTriangle className="w-3 h-3" />
              <span>Focus areas: {weaknesses.join(", ")}</span>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            I'll tailor my responses based on your current level and learning history
          </p>
        </div>
      </div>
    </div>
  );
};
