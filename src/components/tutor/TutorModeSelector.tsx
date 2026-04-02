import { cn } from "@/lib/utils";
import { 
  MessageCircleQuestion, 
  Image, 
  BarChart2, 
  Users,
  Sparkles
} from "lucide-react";

type TutorMode = "socratic" | "visual" | "mistake-analysis" | "study-buddy" | "default";

interface TutorModeSelectorProps {
  mode: TutorMode;
  onModeChange: (mode: TutorMode) => void;
}

const modes = [
  {
    id: "socratic" as const,
    name: "Socratic",
    description: "Learn through guided questions",
    icon: MessageCircleQuestion,
    color: "text-primary",
    bgColor: "bg-secondary/40 hover:bg-secondary/80 text-muted-foreground",
    activeColor: "bg-primary/5 text-primary border-primary/20",
  },
  {
    id: "visual" as const,
    name: "Visual",
    description: "Diagrams & visual explanations",
    icon: Image,
    color: "text-accent",
    bgColor: "bg-secondary/40 hover:bg-secondary/80 text-muted-foreground",
    activeColor: "bg-accent/5 text-accent border-accent/20",
  },
  {
    id: "mistake-analysis" as const,
    name: "Analyzer",
    description: "Pattern detection & targeted help",
    icon: BarChart2,
    color: "text-warning",
    bgColor: "bg-secondary/40 hover:bg-secondary/80 text-muted-foreground",
    activeColor: "bg-warning/5 text-warning border-warning/20",
  },
  {
    id: "study-buddy" as const,
    name: "Study Buddy",
    description: "Fun quizzes & challenges",
    icon: Users,
    color: "text-success",
    bgColor: "bg-secondary/40 hover:bg-secondary/80 text-muted-foreground",
    activeColor: "bg-success/5 text-success border-success/20",
  },
  {
    id: "default" as const,
    name: "Standard",
    description: "General assistance",
    icon: Sparkles,
    color: "text-muted-foreground",
    bgColor: "bg-secondary/40 hover:bg-secondary/80 text-muted-foreground",
    activeColor: "bg-secondary text-foreground border-border",
  },
];

export const TutorModeSelector = ({ mode, onModeChange }: TutorModeSelectorProps) => {
  return (
    <div className="pb-4 border-b border-border/40">
      <div className="flex flex-wrap gap-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
               "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 text-[13px] border border-transparent",
              mode === m.id ? m.activeColor : m.bgColor
            )}
          >
            <m.icon className={cn("w-3.5 h-3.5", mode === m.id ? "" : m.color)} />
            <span className={cn("font-medium", mode === m.id ? "" : "text-foreground")}>{m.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 pl-1">
        {modes.find(m => m.id === mode)?.description}
      </p>
    </div>
  );
};
