import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getLearningPathTree } from "@/api/curriculum.api";
import { 
  Search, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Code, 
  Database, 
  BrainCircuit, 
  Globe, 
  Palette, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface TopicNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id: number | null;
  mastery_percentage: number;
  is_unlocked: boolean;
  total_duration_minutes?: number;
  children?: TopicNode[];
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<TopicNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLearningPathTree();
        setCourses(data as unknown as TopicNode[]);
      } catch (err: any) {
        setError("Failed to retrieve curriculum paths from server.");
        toast.error("Error loading courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Helper to count recursive sub-topics
  const countTopics = (node: TopicNode): number => {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += countTopics(child);
      });
    }
    return count;
  };

  // Helper to calculate total recursive duration in minutes
  const sumDuration = (node: TopicNode): number => {
    let duration = node.total_duration_minutes || 0;
    if (node.children) {
      node.children.forEach(child => {
        duration += sumDuration(child);
      });
    }
    return duration;
  };

  // Helper to format minutes into human readable hours/minutes
  const formatDuration = (mins: number): string => {
    if (mins <= 0) return "10m"; // default fallback for empty/short courses
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ""}`;
    }
    return `${remainingMins}m`;
  };

  // Assign icons based on topic name/keywords
  const getCourseIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("code") || lowerName.includes("program") || lowerName.includes("science")) {
      return Code;
    } else if (lowerName.includes("data") || lowerName.includes("database") || lowerName.includes("structure")) {
      return Database;
    } else if (lowerName.includes("machine") || lowerName.includes("ai") || lowerName.includes("intel") || lowerName.includes("algorithm")) {
      return BrainCircuit;
    } else if (lowerName.includes("web") || lowerName.includes("network") || lowerName.includes("internet")) {
      return Globe;
    } else if (lowerName.includes("design") || lowerName.includes("ui") || lowerName.includes("ux")) {
      return Palette;
    }
    return BookOpen;
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 animate-in fade-in">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Courses</h1>
          <p className="text-slate-500">
            Discover personalized learning paths tailored to your knowledge level and goals.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-in fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search courses, topics, or concepts..." 
              className="pl-10 rounded-xl border-slate-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load</h3>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-medium">No courses found matching your query.</p>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const CourseIcon = getCourseIcon(course.name);
              const totalSubTopics = countTopics(course);
              const totalDuration = sumDuration(course);
              
              return (
                <Link
                  key={course.id}
                  to={`/topic/${course.id}`}
                  className="group flex flex-col p-6 rounded-3xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-300 animate-in fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Icon & Progress */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <CourseIcon className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </div>
                    {course.mastery_percentage > 0 && (
                      <div className="text-right">
                        <span className="text-2xl font-light text-slate-900">{course.mastery_percentage}%</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">complete</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mb-6 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Topic Course
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        course.is_unlocked ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {course.is_unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-650 transition-colors line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {course.description || "No description provided for this course pathway."}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {totalSubTopics} modules
                      </span>
                      <span className="flex items-center gap-1.5" title="Aggregated resource duration">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatDuration(totalDuration)}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-650 transition-colors" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {course.mastery_percentage > 0 && (
                    <div className="mt-4">
                      <div className="h-1 bg-slate-100 w-full rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-750 bg-indigo-500"
                          style={{ width: `${course.mastery_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
