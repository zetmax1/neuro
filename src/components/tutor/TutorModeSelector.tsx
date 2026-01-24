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
    bgColor: "bg-primary/10 hover:bg-primary/20",
    activeColor: "bg-primary text-primary-foreground",
  },
  {
    id: "visual" as const,
    name: "Visual",
    description: "Diagrams & visual explanations",
    icon: Image,
    color: "text-accent",
    bgColor: "bg-accent/10 hover:bg-accent/20",
    activeColor: "bg-accent text-white",
  },
  {
    id: "mistake-analysis" as const,
    name: "Analyzer",
    description: "Pattern detection & targeted help",
    icon: BarChart2,
    color: "text-warning",
    bgColor: "bg-warning/10 hover:bg-warning/20",
    activeColor: "bg-warning text-white",
  },
  {
    id: "study-buddy" as const,
    name: "Study Buddy",
    description: "Fun quizzes & challenges",
    icon: Users,
    color: "text-success",
    bgColor: "bg-success/10 hover:bg-success/20",
    activeColor: "bg-success text-white",
  },
  {
    id: "default" as const,
    name: "Standard",
    description: "General assistance",
    icon: Sparkles,
    color: "text-muted-foreground",
    bgColor: "bg-secondary hover:bg-secondary/80",
    activeColor: "bg-foreground text-background",
  },
];

export const TutorModeSelector = ({ mode, onModeChange }: TutorModeSelectorProps) => {
  return (
    <div className="p-4 border-b border-border">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
        Learning Mode
      </p>
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
              mode === m.id ? m.activeColor : m.bgColor
            )}
          >
            <m.icon className={cn("w-4 h-4", mode === m.id ? "" : m.color)} />
            <span className="font-medium">{m.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {modes.find(m => m.id === mode)?.description}
      </p>
    </div>
  );
};
