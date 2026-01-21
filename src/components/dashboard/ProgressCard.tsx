import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  color: "primary" | "accent" | "success" | "warning";
  subtitle?: string;
}

const colorClasses = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
};

const bgColorClasses = {
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
};

const ProgressCard = ({ title, value, maxValue, color, subtitle }: ProgressCardProps) => {
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <div className="p-6 rounded-2xl bg-card border border-border card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <span className={cn("text-2xl font-bold", `text-${color}`)}>
          {percentage}%
        </span>
      </div>
      <div className={cn("h-2 rounded-full overflow-hidden", bgColorClasses[color])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;
