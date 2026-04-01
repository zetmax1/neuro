import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface MistakeCardProps {
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  concept: string;
  difficulty: string;
  explanation: string;
  quizTitle: string;
  timestamp: number;
}

const LABELS = ["A", "B", "C", "D", "E"];

const diffColor: Record<string, string> = {
  easy:   "text-success bg-success/10",
  medium: "text-warning bg-warning/10",
  hard:   "text-primary bg-primary/10",
};

export const MistakeCard = ({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  concept,
  difficulty,
  explanation,
  quizTitle,
  timestamp,
}: MistakeCardProps) => {
  const dateStr = new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{quizTitle}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded", diffColor[difficulty] ?? "text-muted-foreground")}>
            {difficulty}
          </span>
        </div>
        <span className="text-xs text-muted-foreground/50">{dateStr}</span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-foreground leading-relaxed">{question}</p>

      {/* Answers comparison */}
      <div className="space-y-2">
        {/* User's wrong answer */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-destructive/6 border border-destructive/15">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-destructive/15 shrink-0">
            <XCircle className="w-3.5 h-3.5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground mr-1.5">your answer</span>
            <span className="text-sm text-foreground">
              {LABELS[selectedAnswer]}. {options[selectedAnswer]}
            </span>
          </div>
        </div>

        {/* Correct answer */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-success/6 border border-success/15">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-success/15 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground mr-1.5">correct</span>
            <span className="text-sm text-foreground">
              {LABELS[correctAnswer]}. {options[correctAnswer]}
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
        💡 {explanation}
      </p>
    </div>
  );
};
