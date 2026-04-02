import { ArrowRight, BookOpen, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  type: "next" | "revise" | "ready" | "upcoming";
  title: string;
  description: string;
  action?: string;
  onClick?: () => void;
}

const typeConfig = {
  next: {
    icon: BookOpen,
    label: "Recommended Next",
    iconClass: "text-primary",
  },
  revise: {
    icon: AlertTriangle,
    label: "Needs Revision",
    iconClass: "text-foreground", 
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready to Advance",
    iconClass: "text-primary",
  },
  upcoming: {
    icon: Clock,
    label: "Coming Soon",
    iconClass: "text-muted-foreground",
  },
};

const RecommendationCard = ({ type, title, description, action, onClick }: RecommendationCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isUpcoming = type === "upcoming";

  return (
    <div className={cn(
      "py-4 transition-all duration-200 bg-transparent border-b border-border/40 last:border-0 hover:bg-muted/10 -mx-4 px-4 rounded-xl",
      isUpcoming && "opacity-70"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("mt-1 shrink-0", config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
            {config.label}
          </div>
          <h4 className={cn("font-medium mb-1 truncate", isUpcoming ? "text-muted-foreground" : "text-foreground")}>
            {title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
        </div>
        {action && onClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClick}
            className="shrink-0 text-primary hover:text-primary bg-primary/5 hover:bg-primary/10 rounded-full h-8 px-4 text-xs font-semibold"
          >
            {action}
            <ArrowRight className="w-3 h-3 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;