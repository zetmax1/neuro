import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyBadgeProps {
  current: Difficulty;
  previous: Difficulty | null;
  /** animated = briefly pulse on change */
  animated?: boolean;
}

const config: Record<Difficulty, { label: string; color: string; bg: string; dot: string }> = {
  easy:   { label: "easy",   color: "text-success",     bg: "bg-success/10",  dot: "bg-success" },
  medium: { label: "medium", color: "text-warning",     bg: "bg-warning/10",  dot: "bg-warning" },
  hard:   { label: "hard",   color: "text-primary",     bg: "bg-primary/10",  dot: "bg-primary" },
};

const diffOrder: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

export const DifficultyBadge = ({ current, previous, animated }: DifficultyBadgeProps) => {
  const c = config[current];

  let trend: "up" | "down" | "same" = "same";
  if (previous) {
    const delta = diffOrder[current] - diffOrder[previous];
    if (delta > 0) trend = "up";
    else if (delta < 0) trend = "down";
  }

  const TrendIcon =
    trend === "up"   ? TrendingUp   :
    trend === "down" ? TrendingDown :
    Minus;

  const trendColor =
    trend === "up"   ? "text-success"     :
    trend === "down" ? "text-destructive" :
    "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex flex-col items-end gap-0.5",
        animated && "animate-pulse-soft",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-300",
          c.bg,
          c.color,
          previous && current !== previous ? "border-current/30" : "border-transparent",
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
        {c.label}
        <TrendIcon className={cn("w-3 h-3", trendColor)} />
      </div>
      <span className="text-xs text-muted-foreground/50 pr-0.5">adapting</span>
    </div>
  );
};
