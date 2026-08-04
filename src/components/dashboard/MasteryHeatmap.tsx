import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface MasteryData {
  concept: string;
  level: number; // 0 to 4
  attempts: number;
  mistakes: number;
  lastStudied: string;
}

const masteryData: MasteryData[] = [
  { concept: "Variables", level: 4, attempts: 12, mistakes: 2, lastStudied: "2 days ago" },
  { concept: "Loops", level: 4, attempts: 25, mistakes: 5, lastStudied: "1 day ago" },
  { concept: "Conditionals", level: 3, attempts: 18, mistakes: 8, lastStudied: "3 days ago" },
  { concept: "Arrays", level: 3, attempts: 30, mistakes: 12, lastStudied: "Today" },
  { concept: "Stacks", level: 2, attempts: 15, mistakes: 10, lastStudied: "4 days ago" },
  { concept: "Queues", level: 2, attempts: 10, mistakes: 7, lastStudied: "5 days ago" },
  { concept: "Trees", level: 1, attempts: 40, mistakes: 35, lastStudied: "Today" },
  { concept: "Graphs", level: 1, attempts: 5, mistakes: 4, lastStudied: "Yesterday" },
  { concept: "Sorting", level: 2, attempts: 22, mistakes: 15, lastStudied: "2 days ago" },
  { concept: "Searching", level: 0, attempts: 0, mistakes: 0, lastStudied: "Never" },
  { concept: "Recursion", level: 1, attempts: 50, mistakes: 48, lastStudied: "Today" },
  { concept: "Big O", level: 3, attempts: 14, mistakes: 3, lastStudied: "3 days ago" },
];

const levelColors = [
  "bg-muted/30 border-muted",
  "bg-destructive/20 border-destructive/30",
  "bg-warning/20 border-warning/30",
  "bg-primary/20 border-primary/30",
  "bg-success/20 border-success/30",
];

interface MasteryHeatmapProps {
  concepts?: MasteryData[];
}

const MasteryHeatmap = ({ concepts }: MasteryHeatmapProps) => {
  const displayData = concepts || masteryData;

  return (
    <TooltipProvider>
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Concept Mastery Heatmap</h3>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
            <span>Weak</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={cn("w-3 h-3 rounded-sm border", levelColors[i])} />
              ))}
            </div>
            <span>Strong</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
          {displayData.map((data, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "aspect-square rounded-md border-2 transition-all duration-300 cursor-help hover:scale-110 hover:shadow-md",
                    levelColors[data.level]
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="p-3 max-w-[200px]">
                <div className="space-y-1.5">
                  <p className="font-bold text-sm border-b border-border pb-1 mb-2">{data.concept}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mastery:</span>
                    <span className={cn(
                      "font-semibold",
                      data.level >= 3 ? "text-success" : data.level >= 1 ? "text-warning" : "text-destructive"
                    )}>
                      {data.level * 25}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Attempts:</span>
                    <span>{data.attempts}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mistakes:</span>
                    <span className="text-destructive">{data.mistakes}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last Studied:</span>
                    <span className="italic">{data.lastStudied}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground text-center">
          Visualizing your personalized student model across {displayData.length} key concept{displayData.length === 1 ? "" : "s"}.
        </p>
      </div>
    </TooltipProvider>
  );
};

export default MasteryHeatmap;
