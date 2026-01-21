import Header from "@/components/layout/Header";
import TopicNode, { TopicStatus } from "@/components/learning-path/TopicNode";
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
      { id: "graphs", title: "Graph Fundamentals", status: "recommended", difficulty: "intermediate", prerequisites: ["Trees & Binary Trees"], description: "Nodes and edges for complex relationships" },
      { id: "hash", title: "Hash Tables", status: "locked", difficulty: "intermediate", prerequisites: ["Arrays & Lists"], description: "Fast key-value lookups" },
    ]
  },
  {
    id: "algorithms",
    title: "Algorithms",
    description: "Problem-solving techniques and analysis",
    progress: 25,
    topics: [
      { id: "complexity", title: "Complexity Analysis", status: "completed", difficulty: "intermediate", description: "Big O notation and efficiency" },
      { id: "sorting", title: "Sorting Algorithms", status: "recommended", difficulty: "intermediate", prerequisites: ["Complexity Analysis", "Arrays & Lists"], description: "Ordering data efficiently" },
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
  const [expandedModules, setExpandedModules] = useState<string[]>(["foundations", "data-structures", "algorithms"]);

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
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Learning Path</h1>
          <p className="text-muted-foreground">
            A personalized roadmap based on your knowledge state and learning goals.
          </p>
        </div>

        {/* Filters & Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up delay-100">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter Topics
            </Button>
            <Button variant="outline" size="sm">
              <Layers className="w-4 h-4 mr-2" />
              View as Graph
            </Button>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Recommended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Locked</span>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <div 
              key={module.id} 
              className="rounded-2xl border border-border bg-card overflow-hidden animate-slide-up"
              style={{ animationDelay: `${(moduleIndex + 2) * 100}ms` }}
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    module.progress === 100 
                      ? "bg-success/10 text-success" 
                      : module.progress > 0 
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {expandedModules.includes(module.id) 
                      ? <ChevronDown className="w-6 h-6" />
                      : <ChevronRight className="w-6 h-6" />
                    }
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-foreground">{module.title}</h2>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{module.progress}%</span>
                    <p className="text-xs text-muted-foreground">{module.topics.length} topics</p>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        module.progress === 100 ? "bg-success" : "bg-primary"
                      )}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Topics */}
              {expandedModules.includes(module.id) && (
                <div className="p-6 pt-0 border-t border-border">
                  <div className="grid gap-3 mt-4">
                    {module.topics.map((topic, topicIndex) => (
                      <div 
                        key={topic.id}
                        className="relative"
                        style={{ 
                          marginLeft: topicIndex > 0 ? '24px' : 0,
                          animationDelay: `${topicIndex * 50}ms`
                        }}
                      >
                        {/* Connection Line */}
                        {topicIndex > 0 && (
                          <div className="absolute -left-6 top-1/2 w-6 h-px bg-border" />
                        )}
                        <TopicNode
                          {...topic}
                          onClick={() => console.log("Navigate to topic:", topic.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LearningPath;
