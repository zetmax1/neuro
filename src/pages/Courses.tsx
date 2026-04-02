import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  BookOpen,
  Clock,
  BarChart3,
  ArrowRight,
  Code,
  Database,
  BrainCircuit,
  Globe,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const courses = [
  {
    id: "cs-fundamentals",
    title: "Computer science fundamentals",
    description: "Master the core concepts of programming, algorithms, and data structures.",
    icon: Code,
    color: "hsl(234, 89%, 58%)",
    topics: 24,
    hours: 15,
    progress: 62,
    difficulty: "beginner",
    category: "Programming",
  },
  {
    id: "data-structures",
    title: "Data structures mastery",
    description: "Deep dive into arrays, trees, graphs, hash tables, and more.",
    icon: Database,
    color: "hsl(172, 66%, 50%)",
    topics: 18,
    hours: 12,
    progress: 45,
    difficulty: "intermediate",
    category: "Programming",
  },
  {
    id: "machine-learning",
    title: "Machine learning essentials",
    description: "From linear regression to neural networks - understand ML fundamentals.",
    icon: BrainCircuit,
    color: "hsl(38, 92%, 50%)",
    topics: 20,
    hours: 18,
    progress: 15,
    difficulty: "advanced",
    category: "AI/ML",
  },
  {
    id: "web-development",
    title: "Modern web development",
    description: "Build responsive, accessible, and performant web applications.",
    icon: Globe,
    color: "hsl(199, 89%, 48%)",
    topics: 28,
    hours: 20,
    progress: 0,
    difficulty: "intermediate",
    category: "Web",
  },
  {
    id: "ui-design",
    title: "UI/UX design principles",
    description: "Learn user-centered design, accessibility, and visual hierarchy.",
    icon: Palette,
    color: "hsl(340, 82%, 52%)",
    topics: 16,
    hours: 10,
    progress: 0,
    difficulty: "beginner",
    category: "Design",
  },
];

const categories = ["All", "Programming", "AI/ML", "Web", "Design"];

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore courses</h1>
          <p className="text-muted-foreground">
            Discover personalized learning paths tailored to your knowledge level and goals.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up delay-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses, topics, or concepts..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 animate-slide-up delay-200">
          {categories.map((category, index) => (
            <Button
              key={category}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mt-12">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              to="/course"
              className="group flex flex-col p-6 rounded-2xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Icon & Progress */}
              <div className="flex items-start justify-between mb-5">
                <div 
                  className="w-12 h-12 flex items-center justify-center shrink-0"
                >
                  <course.icon className="w-8 h-8 text-foreground/80 group-hover:text-primary transition-colors" />
                </div>
                {course.progress > 0 && (
                  <div className="text-right">
                    <span className="text-2xl font-light text-foreground">{course.progress}%</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">complete</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {course.category}
                  </span>
                  <span className="text-muted-foreground/30">•</span>
                  <span 
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      course.difficulty === "beginner" && "text-success",
                      course.difficulty === "intermediate" && "text-warning",
                      course.difficulty === "advanced" && "text-destructive"
                    )}
                  >
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-medium tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5 text-sm text-muted-foreground/80">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-4 h-4" />
                    {course.topics} topics
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4" />
                    {course.hours}h
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center transition-colors group-hover:bg-primary/5">
                  <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Progress Bar */}
              {course.progress > 0 && (
                <div className="mt-5">
                  <div className="h-[2px] bg-border/40 w-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-700 bg-primary"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Courses;
