import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  subtitle?: string;
  variant?: "default" | "highlight";
  showPercentage?: boolean;
  unit?: string;
}

const ProgressCard = ({
  title,
  value,
  maxValue,
  subtitle,
  variant = "default",
  showPercentage = true,
  unit,
}: ProgressCardProps) => {
  const percentage = Math.min(100, Math.round((value / Math.max(1, maxValue)) * 100));
  const isHighlight = variant === "highlight";

  const displayValue = !showPercentage
    ? `${value}${unit ? ` ${unit}` : ""}`
    : `${percentage}%`;

  return (
    <div className={cn(
      "py-4 transition-colors duration-200 bg-transparent border-t border-border/40 space-y-3",
    )}>
      <div className="flex items-end justify-between">
        <div>
          <h3 className={cn("font-medium tracking-tight text-foreground", isHighlight && "text-primary font-semibold")}>{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <span className={cn("text-2xl font-light", isHighlight ? "text-primary font-medium" : "text-foreground")}>
          {displayValue}
        </span>
      </div>
      
      {/* Ultra-thin Progress Line */}
      <div className="h-px bg-border/40 w-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out",
            isHighlight ? "bg-primary" : "bg-muted-foreground/30" 
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;