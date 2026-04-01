import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface AnswerOptionProps {
  label: string;       // "A", "B", "C"…
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean; // true after user answered
  onClick: () => void;
  animationDelay?: number;
}

export const AnswerOption = ({
  label,
  text,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  animationDelay = 0,
}: AnswerOptionProps) => {
  const showCorrect = isRevealed && isCorrect;
  const showWrong   = isRevealed && isSelected && !isCorrect;
  // Show the correct option highlighted even if user picked wrong
  const showCorrectHighlight = isRevealed && isCorrect && !isSelected;

  return (
    <button
      onClick={onClick}
      disabled={isRevealed}
      style={{ animationDelay: `${animationDelay}ms` }}
      className={cn(
        "animate-slide-up w-full p-4 rounded-2xl border-2 text-left transition-all duration-250 flex items-center gap-4 group",
        // Default idle state
        !isRevealed && "border-border bg-card hover:border-primary/60 hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        // Selected before reveal
        isSelected && !isRevealed && "border-primary bg-primary/8",
        // After reveal – correct picked by user
        showCorrect && "border-success bg-success/10 cursor-default",
        // After reveal – wrong picked by user
        showWrong && "border-destructive bg-destructive/10 cursor-default",
        // After reveal – the correct option (user picked differently)
        showCorrectHighlight && "border-success/50 bg-success/5 cursor-default",
        // All other options after reveal
        isRevealed && !isSelected && !isCorrect && "border-border/50 bg-card/60 opacity-60 cursor-default",
      )}
    >
      {/* Letter Badge */}
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-250",
          !isRevealed && "bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground",
          isSelected && !isRevealed && "bg-primary text-primary-foreground",
          showCorrect && "bg-success text-white",
          showWrong   && "bg-destructive text-white",
          showCorrectHighlight && "bg-success/20 text-success",
          isRevealed && !isSelected && !isCorrect && "bg-muted text-muted-foreground",
        )}
      >
        {showCorrect ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : showWrong ? (
          <XCircle className="w-5 h-5" />
        ) : showCorrectHighlight ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          label
        )}
      </div>

      {/* Option Text */}
      <span
        className={cn(
          "flex-1 text-sm leading-relaxed transition-colors duration-200",
          !isRevealed && "text-foreground",
          showCorrect  && "text-success font-medium",
          showWrong    && "text-destructive",
          showCorrectHighlight && "text-success/80 font-medium",
          isRevealed && !isSelected && !isCorrect && "text-muted-foreground",
        )}
      >
        {text}
      </span>

      {/* Right indicator — only one badge per option */}
      {showCorrect && !showCorrectHighlight && (
        <span className="text-xs font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full shrink-0">
          Correct ✓
        </span>
      )}
      {showWrong && (
        <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full shrink-0">
          Wrong
        </span>
      )}
      {showCorrectHighlight && (
        <span className="text-xs font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full shrink-0">
          Correct ✓
        </span>
      )}
    </button>
  );
};
