import Header from "@/components/layout/Header";
import ProgressCard from "@/components/dashboard/ProgressCard";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import SubjectMasteryCard from "@/components/dashboard/SubjectMasteryCard";
import MasteryHeatmap from "@/components/dashboard/MasteryHeatmap";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BookOpen, 
  Code, 
  Database, 
  BrainCircuit, 
  TrendingUp,
  Calendar,
  Target,
  Plus,
  Play,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  // Notice: We removed the "color" property entirely. 
  // We use the primary color for the highest mastery, and neutral foreground for the rest.
  const subjects = [
    { 
      subject: "Data Structures", 
      mastery: 78, 
      topics: 12, 
      completedTopics: 9,
      icon: <Database className="w-5 h-5 text-primary" />,
    },
    { 
      subject: "Algorithms", 
      mastery: 62, 
      topics: 15, 
      completedTopics: 9,
      icon: <Code className="w-5 h-5 text-foreground" />,
    },
    { 
      subject: "Machine Learning", 
      mastery: 45, 
      topics: 20, 
      completedTopics: 9,
      icon: <BrainCircuit className="w-5 h-5 text-foreground" />,
    },
  ];

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Structured App Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-border/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Welcome back. Here's your personalized learning overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50">
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              {today}
            </div>
            {/* New: quick action buttons */}
            <Link to="/session?topic=loops">
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                <Play className="w-3.5 h-3.5" />
                study session
              </Button>
            </Link>
            <Link to="/mistakes">
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                review mistakes
              </Button>
            </Link>
            <Link to="/learning-path">
              <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <ProgressCard
            title="Overall Progress"
            value={62}
            maxValue={100}
            variant="highlight"
            subtitle="Across all subjects"
          />
          <ProgressCard
            title="Weekly Goal"
            value={4}
            maxValue={5}
            subtitle="Topics completed"
          />
          <ProgressCard
            title="Current Streak"
            value={7}
            maxValue={10}
            subtitle="Days in a row"
          />
          <ProgressCard
            title="Assessments"
            value={85}
            maxValue={100}
            subtitle="Average score"
          />
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          
          {/* Left Column - Subject Mastery */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Your knowledge map</h2>
              <Link to="/learning-path">
                <Button variant="link" size="sm" className="text-primary h-auto p-0 font-medium">
                  View full path
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <SubjectMasteryCard key={subject.subject} {...subject} />
              ))}
              
              <Link 
                to="/courses" 
                className="group p-6 rounded-2xl border border-border bg-card/50 hover:bg-secondary/50 hover:border-foreground/20 transition-all duration-200 flex flex-col items-center justify-center text-center h-full min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium text-foreground text-sm">Explore more subjects</span>
                <span className="text-xs text-muted-foreground mt-1">Browse the catalog</span>
              </Link>
            </div>

            {/* Mastery Heatmap Integration */}
            <div className="mt-10">
              <MasteryHeatmap />
            </div>
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">What's next for you</h2>
            
            <div className="space-y-3">
              <RecommendationCard
                type="next"
                title="Graph algorithms"
                description="Build on your tree knowledge to master graph traversal techniques."
                action="Start"
                onClick={() => {}}
              />
              <RecommendationCard
                type="revise"
                title="Binary search trees"
                description="Your assessment showed some gaps. A quick review will help solidify this foundation."
                action="Review"
                onClick={() => {}}
              />
              <RecommendationCard
                type="ready"
                title="Dynamic programming"
                description="You've completed all prerequisites! Ready to tackle advanced problem-solving."
                action="Begin"
                onClick={() => {}}
              />
              <RecommendationCard
                type="upcoming"
                title="Neural networks"
                description="Complete Linear Algebra basics first to unlock this topic."
              />
            </div>
          </div>
        </div>

        {/* Activity Feed Section */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-secondary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Recent activity</h2>
              <p className="text-sm text-muted-foreground">Your learning journey over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+12% improvement</span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {[
              { day: "Today", activity: "Completed Assessment: Sorting Algorithms", score: "92%", icon: Target },
              { day: "Yesterday", activity: "Studied: Hash Tables & Applications", time: "45 min", icon: BookOpen },
              { day: "2 days ago", activity: "Completed: Graph Basics Module", status: "Mastered", icon: Code },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.activity}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.day}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  {item.score && (
                    <span className="text-sm font-semibold text-foreground">{item.score}</span>
                  )}
                  {item.time && (
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">{item.time}</span>
                  )}
                  {item.status && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default Dashboard;