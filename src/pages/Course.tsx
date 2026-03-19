import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2,
  Clock,
  BarChart3,
  Link as LinkIcon,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Course = () => {
  const topic = {
    title: "Trees & binary trees",
    module: "Data structures",
    description: "Learn about hierarchical data structures including binary trees, BSTs, and tree traversal algorithms.",
    progress: 65,
    estimatedTime: "2.5 hours",
    difficulty: "intermediate",
    materials: [
      { type: "video", title: "Introduction to trees", duration: "12 min", completed: true },
      { type: "text", title: "Tree terminology & properties", duration: "8 min", completed: true },
      { type: "video", title: "Binary tree implementation", duration: "18 min", completed: true },
      { type: "text", title: "Tree traversal methods", duration: "15 min", completed: false },
      { type: "pdf", title: "Practice problems", duration: "20 min", completed: false },
    ],
    prerequisites: ["Arrays & lists", "Stacks & queues"],
    relatedTopics: ["Graph fundamentals", "Heap data structure", "Binary search trees"],
    whyThisTopic: "Trees are fundamental for understanding more complex data structures like graphs and heaps. They're essential for efficient searching, sorting, and hierarchical data representation.",
  };

  const materialIcons = {
    video: Video,
    text: BookOpen,
    pdf: FileText,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">
            Learning path
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>{topic.module}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{topic.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic Header */}
            <div className="animate-slide-up">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{topic.module}</Badge>
                <Badge 
                  className={cn(
                    topic.difficulty === "beginner" && "bg-success/10 text-success border-success/20",
                    topic.difficulty === "intermediate" && "bg-warning/10 text-warning border-warning/20",
                    topic.difficulty === "advanced" && "bg-destructive/10 text-destructive border-destructive/20"
                  )}
                  variant="outline"
                >
                  {topic.difficulty}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">{topic.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{topic.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{topic.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">{topic.progress}% complete</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="animate-slide-up delay-100">
              <Progress value={topic.progress} className="h-2" />
            </div>

            {/* Why This Topic */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 animate-slide-up delay-100">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" />
                Why This Topic?
              </h3>
              <p className="text-muted-foreground">{topic.whyThisTopic}</p>
            </div>

            {/* Learning Materials */}
            <div className="animate-slide-up delay-200">
              <h2 className="text-xl font-semibold text-foreground mb-4">Learning materials</h2>
              <div className="space-y-3">
                {topic.materials.map((material, index) => {
                  const Icon = materialIcons[material.type as keyof typeof materialIcons];
                  return (
                    <button
                      key={index}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
                        material.completed 
                          ? "bg-success/5 border-success/20" 
                          : "bg-card border-border hover:border-primary hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        material.completed ? "bg-success/10" : "bg-primary/10"
                      )}>
                        {material.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Icon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium",
                          material.completed ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {material.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {material.type.charAt(0).toUpperCase() + material.type.slice(1)} • {material.duration}
                        </p>
                      </div>
                      <ArrowRight className={cn(
                        "w-5 h-5",
                        material.completed ? "text-muted" : "text-primary"
                      )} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border animate-slide-up delay-300">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous topic
              </Button>
              <Button variant="hero">
                Continue learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prerequisites */}
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-100">
              <h3 className="font-semibold text-foreground mb-4">Prerequisites</h3>
              <div className="space-y-2">
                {topic.prerequisites.map((prereq) => (
                  <div 
                    key={prereq}
                    className="flex items-center gap-3 p-3 rounded-lg bg-success/5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">{prereq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Topics */}
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-200">
              <h3 className="font-semibold text-foreground mb-4">Related topics</h3>
              <div className="space-y-2">
                {topic.relatedTopics.map((related) => (
                  <button 
                    key={related}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <span className="text-sm text-foreground">{related}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-300">
              <h3 className="font-semibold text-foreground mb-4">Quick actions</h3>
              <div className="space-y-2">
                <Link to="/assessment?type=topic&topic=data-structures">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Take assessment
                  </Button>
                </Link>
                <Link to="/tutor">
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Ask AI tutor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Course;
