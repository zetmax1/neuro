import { cn } from "@/lib/utils";

interface QuizHeaderProps {
  title: string;
  current: number;   // 1-indexed question number being shown
  total: number;
}

export const QuizHeader = ({ title, current, total }: QuizHeaderProps) => {
  const progress = ((current - 1) / total) * 100;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title + Counter row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Question <span className="font-medium text-foreground">{current}</span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
          </p>
        </div>

        {/* Circular-ish step counter */}
        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="23"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="23"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 23}`}
              strokeDashoffset={`${2 * Math.PI * 23 * (1 - progress / 100)}`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute text-xs font-bold text-foreground">
            {current}/{total}
          </span>
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className={cn("h-full rounded-full gradient-primary transition-all duration-500 ease-out")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
