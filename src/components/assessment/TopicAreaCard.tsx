import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface TopicAreaCardProps {
  topic: string;
  correct: number;
  total: number;
  variant: "strong" | "weak";
  animationDelay?: number;
}

export const TopicAreaCard = ({
  topic,
  correct,
  total,
  variant,
  animationDelay = 0,
}: TopicAreaCardProps) => {
  const percentage = Math.round((correct / total) * 100);
  const isStrong = variant === "strong";

  return (
    <div
      style={{ animationDelay: `${animationDelay}ms` }}
      className={cn(
        "animate-slide-up flex items-start gap-3 p-4 rounded-xl border",
        isStrong
          ? "bg-success/8 border-success/20"
          : "bg-warning/8 border-warning/20",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          isStrong ? "bg-success/15" : "bg-warning/15",
        )}
      >
        {isStrong ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-warning" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-sm font-medium text-foreground truncate">{topic}</span>
          <span
            className={cn(
              "text-xs font-bold shrink-0",
              isStrong ? "text-success" : "text-warning",
            )}
          >
            {correct}/{total}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isStrong ? "bg-success" : "bg-warning",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-1">{percentage}% correct</p>
      </div>
    </div>
  );
};
