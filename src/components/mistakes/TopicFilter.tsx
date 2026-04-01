import { cn } from "@/lib/utils";

interface TopicFilterProps {
  topics: string[];
  selected: string;   // "all" or a topic name
  onChange: (topic: string) => void;
  counts: Record<string, number>;
}

export const TopicFilter = ({ topics, selected, onChange, counts }: TopicFilterProps) => {
  const all = ["all", ...topics];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((topic) => {
        const isSelected = selected === topic;
        const count = topic === "all"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[topic] ?? 0);

        return (
          <button
            key={topic}
            onClick={() => onChange(topic)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border",
              isSelected
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
            )}
          >
            <span>{topic === "all" ? "all topics" : topic}</span>
            <span
              className={cn(
                "text-xs rounded px-1",
                isSelected ? "bg-background/20 text-background" : "text-muted-foreground/60",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
