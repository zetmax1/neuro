import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  subtitle?: string;
  // We can keep a subtle 'highlight' option if you want one card to stand out, 
  // but by default they should be unified.
  variant?: "default" | "highlight"; 
}

const ProgressCard = ({ title, value, maxValue, subtitle, variant = "default" }: ProgressCardProps) => {
  const percentage = Math.round((value / maxValue) * 100);
  const isHighlight = variant === "highlight";

  return (
    <div className={cn(
      "p-6 rounded-2xl bg-card border transition-colors duration-200",
      isHighlight ? "border-primary/50 shadow-sm" : "border-border hover:border-foreground/20"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-2xl font-bold text-foreground">
          {percentage}%
        </span>
      </div>
      
      {/* Unified Progress Bar */}
      <div className="h-2 rounded-full overflow-hidden bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            isHighlight ? "bg-primary" : "bg-foreground" 
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;