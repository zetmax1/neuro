import Header from "@/components/layout/Header";
import TopicNode, { TopicStatus } from "@/components/learning-path/TopicNode";
import KnowledgeGraph from "@/components/learning-path/KnowledgeGraph";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Filter, Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  description?: string;
  recommendationReason?: string;
  isBlocked?: boolean;
  blockedReason?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
}

const modules: Module[] = [
  {
    id: "foundations",
    title: "Foundations",
    description: "Core concepts and fundamental knowledge",
    progress: 100,
    topics: [
      { id: "intro", title: "Introduction to Programming", status: "completed", difficulty: "beginner", description: "Basic programming concepts and paradigms" },
      { id: "variables", title: "Variables & Data Types", status: "completed", difficulty: "beginner", description: "Understanding data representation" },
      { id: "control", title: "Control Structures", status: "completed", difficulty: "beginner", prerequisites: ["Variables & Data Types"], description: "Loops, conditionals, and flow control" },
    ]
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Essential data organization techniques",
    progress: 67,
    topics: [
      { id: "arrays", title: "Arrays & Lists", status: "completed", difficulty: "beginner", prerequisites: ["Control Structures"], description: "Sequential data storage" },
      { id: "stacks", title: "Stacks & Queues", status: "completed", difficulty: "intermediate", prerequisites: ["Arrays & Lists"], description: "LIFO and FIFO structures" },
      { id: "trees", title: "Trees & Binary Trees", status: "in-progress", difficulty: "intermediate", prerequisites: ["Stacks & Queues"], description: "Hierarchical data structures" },
      { id: "graphs", title: "Graph Fundamentals", status: "recommended", difficulty: "intermediate", prerequisites: ["Trees & Binary Trees"], recommendationReason: "Builds on your tree knowledge", description: "Nodes and edges for complex relationships" },
      { id: "hash", title: "Hash Tables", status: "locked", difficulty: "intermediate", isBlocked: true, blockedReason: "Complete 'Arrays & Lists' first", prerequisites: ["Arrays & Lists"], description: "Fast key-value lookups" },
    ]
  },
  {
    id: "algorithms",
    title: "Algorithms",
    description: "Problem-solving techniques and analysis",
    progress: 25,
    topics: [
      { id: "complexity", title: "Complexity Analysis", status: "completed", difficulty: "intermediate", description: "Big O notation and efficiency" },
      { id: "sorting", title: "Sorting Algorithms", status: "recommended", difficulty: "intermediate", recommendationReason: "Essential for efficiency", prerequisites: ["Complexity Analysis", "Arrays & Lists"], description: "Ordering data efficiently" },
      { id: "searching", title: "Search Algorithms", status: "locked", difficulty: "intermediate", prerequisites: ["Sorting Algorithms"], description: "Finding elements in data" },
      { id: "dynamic", title: "Dynamic Programming", status: "locked", difficulty: "advanced", prerequisites: ["Search Algorithms", "Graph Fundamentals"], description: "Optimal substructure problems" },
    ]
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    description: "Complex concepts for deep understanding",
    progress: 0,
    topics: [
      { id: "ml-intro", title: "Machine Learning Basics", status: "locked", difficulty: "advanced", prerequisites: ["Dynamic Programming"], description: "Introduction to ML concepts" },
      { id: "neural", title: "Neural Networks", status: "locked", difficulty: "advanced", prerequisites: ["Machine Learning Basics"], description: "Deep learning fundamentals" },
    ]
  },
];

const LearningPath = () => {
  const [expandedModules, setExpandedModules] = useState<string[]>(["foundations", "data-structures", "algorithms", "advanced"]);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-slide-up">
          <div>
            <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">Your learning path</h1>
            <p className="text-muted-foreground text-lg">
              A personalized roadmap based on your knowledge state.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-full px-4" 
              onClick={() => setViewMode(viewMode === "list" ? "graph" : "list")}
            >
              <Layers className="w-4 h-4 mr-2" />
              {viewMode === "list" ? "View Graph" : "View List"}
            </Button>
          </div>
        </div>

        {/* Smart Next Action - Minimalist */}
        <div className="mb-16 p-8 rounded-[2rem] bg-background border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  Up Next
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Trees & Binary Trees</h2>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                You're currently mastering hierarchical data structures. Completing this will unlock 
                <span className="text-foreground font-medium mx-1">Graph Fundamentals</span> 
                and move you closer to your data structures goal.
              </p>
            </div>
            <Button size="lg" className="rounded-full text-base px-8 h-12 shadow-sm font-medium transition-transform hover:scale-[1.02]">
              Continue Session
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Modules / Graph Content */}
        {viewMode === "graph" ? (
          <div className="animate-fade-in">
            <KnowledgeGraph modules={modules} />
          </div>
        ) : (
          <div className="space-y-12">
          {modules.map((module, moduleIndex) => (
            <div 
              key={module.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${(moduleIndex + 2) * 100}ms` }}
            >
              {/* Module Header - Typography focus */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full group flex items-end justify-between py-2 border-b border-border/50 hover:border-foreground/20 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-medium text-foreground tracking-tight group-hover:text-primary transition-colors">{module.title}</h2>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 pb-1">
                  <span className="text-sm font-medium text-muted-foreground font-mono">{module.progress}%</span>
                  <div className={cn(
                    "text-muted-foreground/40 transition-transform duration-300",
                    expandedModules.includes(module.id) ? "rotate-180" : ""
                  )}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </button>
              
              {/* Thin progress line */}
              <div className="w-full h-[1px] bg-border/20">
                <div 
                  className={cn(
                    "h-full transition-all duration-700",
                    module.progress === 100 ? "bg-muted-foreground/30" : "bg-primary"
                  )}
                  style={{ width: `${module.progress}%` }}
                />
              </div>

              {/* Topics List - Indented and minimal */}
              <div className={cn(
                "grid transition-all duration-500 origin-top overflow-hidden",
                expandedModules.includes(module.id) 
                  ? "grid-rows-[1fr] opacity-100 mt-6" 
                  : "grid-rows-[0fr] opacity-0 mt-0"
              )}>
                <div className="min-h-0">
                  <div className="pl-4 relative flex flex-col gap-1">
                    {/* Connecting line */}
                    <div className="absolute left-[25px] top-4 bottom-4 w-px bg-border/40 -z-10" />
                    
                    {module.topics.map((topic, topicIndex) => (
                      <div 
                        key={topic.id}
                        className="relative"
                        style={{ animationDelay: `${topicIndex * 50}ms` }}
                      >
                        <TopicNode
                          {...topic}
                          onClick={() => console.log("Navigate to topic:", topic.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* End of timeline indicator */}
          <div className="py-8 text-center text-muted-foreground/30 flex flex-col items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-border" />
             <div className="w-1 h-1 rounded-full bg-border" />
             <div className="w-1 h-1 rounded-full bg-border" />
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default LearningPath;











