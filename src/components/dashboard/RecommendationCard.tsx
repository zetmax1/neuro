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
    iconClass: "text-primary bg-primary/10",
  },
  revise: {
    icon: AlertTriangle,
    label: "Needs Revision",
    // Using a subtle foreground/neutral treatment instead of bright yellow/orange
    iconClass: "text-foreground bg-secondary", 
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready to Advance",
    iconClass: "text-primary bg-primary/10",
  },
  upcoming: {
    icon: Clock,
    label: "Coming Soon",
    iconClass: "text-muted-foreground bg-muted",
  },
};

const RecommendationCard = ({ type, title, description, action, onClick }: RecommendationCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isUpcoming = type === "upcoming";

  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-200",
      isUpcoming ? "bg-transparent border-dashed border-border" : "bg-card border-border hover:border-foreground/20"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {config.label}
          </div>
          <h4 className={cn("font-semibold mb-1 truncate", isUpcoming ? "text-muted-foreground" : "text-foreground")}>
            {title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
        </div>
        {action && onClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClick}
            className="shrink-0 text-primary hover:text-primary hover:bg-primary/10 -mr-2"
          >
            {action}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;