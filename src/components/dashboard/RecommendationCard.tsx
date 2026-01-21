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
    bgClass: "bg-primary/5 border-primary/20",
    iconClass: "text-primary bg-primary/10",
    labelClass: "text-primary",
  },
  revise: {
    icon: AlertTriangle,
    label: "Needs Revision",
    bgClass: "bg-warning/5 border-warning/20",
    iconClass: "text-warning bg-warning/10",
    labelClass: "text-warning",
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready to Advance",
    bgClass: "bg-success/5 border-success/20",
    iconClass: "text-success bg-success/10",
    labelClass: "text-success",
  },
  upcoming: {
    icon: Clock,
    label: "Coming Soon",
    bgClass: "bg-muted border-border",
    iconClass: "text-muted-foreground bg-muted",
    labelClass: "text-muted-foreground",
  },
};

const RecommendationCard = ({ type, title, description, action, onClick }: RecommendationCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("p-5 rounded-2xl border transition-all duration-200 hover:shadow-md", config.bgClass)}>
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-xs font-medium uppercase tracking-wider mb-1", config.labelClass)}>
            {config.label}
          </div>
          <h4 className="font-semibold text-foreground mb-1 truncate">{title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        {action && onClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClick}
            className="shrink-0 text-primary hover:text-primary"
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
