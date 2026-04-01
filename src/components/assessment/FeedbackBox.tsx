import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface FeedbackBoxProps {
  isCorrect: boolean;
  explanation: string;
  wrongHint?: string; // optional: why the selected wrong answer was wrong
}

export const FeedbackBox = ({ isCorrect, explanation, wrongHint }: FeedbackBoxProps) => {
  return (
    <div
      className={cn(
        "animate-fade-in mt-5 rounded-2xl border p-5 space-y-3",
        isCorrect
          ? "bg-success/8 border-success/25"
          : "bg-orange-50/80 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-700/30",
      )}
    >
      {/* Status badge */}
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <span className="text-sm font-semibold text-success">Correct answer</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-destructive shrink-0" />
            <span className="text-sm font-semibold text-destructive">Incorrect answer</span>
          </>
        )}
      </div>

      {/* Explanation */}
      <div className="flex items-start gap-2">
        <Lightbulb
          className={cn(
            "w-4 h-4 mt-0.5 shrink-0",
            isCorrect ? "text-success/70" : "text-warning",
          )}
        />
        <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
      </div>

      {/* Why wrong hint */}
      {!isCorrect && wrongHint && (
        <p className="text-xs text-muted-foreground/75 pl-6 italic">{wrongHint}</p>
      )}
    </div>
  );
};
