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
    title: "Computer Science Fundamentals",
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
    title: "Data Structures Mastery",
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
    title: "Machine Learning Essentials",
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
    title: "Modern Web Development",
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
    title: "UI/UX Design Principles",
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              to="/course"
              className="group p-6 rounded-2xl bg-card border border-border card-hover animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Icon & Progress */}
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${course.color}15` }}
                >
                  <course.icon className="w-7 h-7" style={{ color: course.color }} />
                </div>
                {course.progress > 0 && (
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{course.progress}%</span>
                    <p className="text-xs text-muted-foreground">complete</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      course.difficulty === "beginner" && "border-success/30 text-success",
                      course.difficulty === "intermediate" && "border-warning/30 text-warning",
                      course.difficulty === "advanced" && "border-destructive/30 text-destructive"
                    )}
                  >
                    {course.difficulty}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.topics} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.hours}h
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Progress Bar */}
              {course.progress > 0 && (
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${course.progress}%`,
                        backgroundColor: course.color 
                      }}
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
