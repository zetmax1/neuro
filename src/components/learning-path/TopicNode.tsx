import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, Play, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type TopicStatus = "completed" | "in-progress" | "recommended" | "locked";

interface TopicNodeProps {
  id: string;
  title: string;
  status: TopicStatus;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  description?: string;
  onClick?: () => void;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    bgClass: "bg-success",
    borderClass: "border-success",
    textClass: "text-success",
    label: "Completed",
  },
  "in-progress": {
    icon: Play,
    bgClass: "gradient-primary",
    borderClass: "border-primary",
    textClass: "text-primary",
    label: "In Progress",
  },
  recommended: {
    icon: Clock,
    bgClass: "gradient-accent",
    borderClass: "border-accent",
    textClass: "text-accent",
    label: "Recommended",
  },
  locked: {
    icon: Lock,
    bgClass: "bg-muted",
    borderClass: "border-muted",
    textClass: "text-muted-foreground",
    label: "Locked",
  },
};

const difficultyColors = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-warning/10 text-warning",
  advanced: "bg-destructive/10 text-destructive",
};

const TopicNode = ({ 
  title, 
  status, 
  difficulty, 
  prerequisites,
  description,
  onClick 
}: TopicNodeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isInteractive = status !== "locked";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={isInteractive ? onClick : undefined}
          disabled={!isInteractive}
          className={cn(
            "group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full",
            config.borderClass,
            isInteractive 
              ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-card" 
              : "opacity-60 cursor-not-allowed bg-muted/30",
            status === "in-progress" && "shadow-glow"
          )}
        >
          {/* Status Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            config.bgClass
          )}>
            <Icon className={cn(
              "w-6 h-6",
              status === "locked" ? "text-muted-foreground" : "text-white"
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold truncate",
                status === "locked" ? "text-muted-foreground" : "text-foreground"
              )}>
                {title}
              </h3>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                difficultyColors[difficulty]
              )}>
                {difficulty}
              </span>
            </div>
            <p className={cn(
              "text-xs font-medium uppercase tracking-wider",
              config.textClass
            )}>
              {config.label}
            </p>
          </div>

          {/* Animated ring for recommended/in-progress */}
          {(status === "recommended" || status === "in-progress") && (
            <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
              style={{
                background: `linear-gradient(135deg, ${status === "in-progress" ? "hsl(234, 89%, 58%)" : "hsl(172, 66%, 50%)"} 0%, transparent 50%)`,
                filter: "blur(8px)"
              }}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {prerequisites && prerequisites.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Prerequisites:</p>
              <ul className="text-xs text-muted-foreground">
                {prerequisites.map((prereq) => (
                  <li key={prereq}>• {prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default TopicNode;
