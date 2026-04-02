import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, CircleDashed, CircleDot } from "lucide-react";
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
  recommendationReason?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  onClick?: () => void;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    textClass: "text-muted-foreground",
    iconClass: "text-muted-foreground/60",
    label: "Completed",
  },
  "in-progress": {
    icon: CircleDot,
    textClass: "text-foreground font-semibold",
    iconClass: "text-primary",
    label: "In Progress",
  },
  recommended: {
    icon: CircleDashed,
    textClass: "text-foreground",
    iconClass: "text-muted-foreground/60",
    label: "Recommended",
  },
  locked: {
    icon: Lock,
    textClass: "text-muted-foreground/50",
    iconClass: "text-muted-foreground/30",
    label: "Locked",
  },
};

const TopicNode = ({ 
  title, 
  status, 
  difficulty, 
  prerequisites,
  description,
  isBlocked,
  blockedReason,
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
            "group relative flex items-center gap-4 py-2 w-full text-left transition-colors bg-transparent",
             isInteractive && !isBlocked
              ? "hover:bg-muted/20 cursor-pointer rounded-lg px-2 -mx-2" 
              : "cursor-not-allowed px-2 -mx-2",
          )}
        >
          <div className="flex items-center justify-center w-5 shrink-0 z-10 bg-background/80 backdrop-blur-sm py-1">
             <Icon className={cn("w-4 h-4", config.iconClass)} />
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between gap-3">
                 <div className="flex items-center gap-3">
                     <h3 className={cn("text-sm transition-colors", config.textClass)}>
                          {title}
                     </h3>
                     {status === "recommended" && (
                         <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">Recommended</span>
                     )}
                     {isBlocked && blockedReason && (
                        <span className="text-[10px] uppercase font-bold text-destructive opacity-70 border border-destructive/20 px-1.5 py-0.5 rounded">Requirement unmet</span>
                     )}
                 </div>
                 <div className="flex items-center gap-4">
                     <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{difficulty}</span>
                 </div>
             </div>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs border-border/50 text-xs">
        <div className="space-y-2">
          <p className="font-semibold text-sm">{title}</p>
          {description && <p className="text-muted-foreground">{description}</p>}
          {prerequisites && prerequisites.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-1">Prerequisites:</p>
              <ul className="text-muted-foreground">
                {prerequisites.map((prereq) => (
                  <li key={prereq}>• {prereq}</li>
                ))}
              </ul>
            </div>
          )}
          {isBlocked && (
            <div className="pt-2 border-t border-border mt-2">
              <p className="font-bold text-destructive">Knowledge Gap Detected</p>
              <p className="text-muted-foreground italic">Master the prerequisites to unlock this topic.</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default TopicNode;
