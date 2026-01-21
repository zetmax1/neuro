import Header from "@/components/layout/Header";
import ProgressCard from "@/components/dashboard/ProgressCard";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import SubjectMasteryCard from "@/components/dashboard/SubjectMasteryCard";
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
  Target
} from "lucide-react";

const Dashboard = () => {
  const subjects = [
    { 
      subject: "Data Structures", 
      mastery: 78, 
      topics: 12, 
      completedTopics: 9,
      icon: <Database className="w-6 h-6 text-primary" />,
      color: "hsl(234, 89%, 58%)"
    },
    { 
      subject: "Algorithms", 
      mastery: 62, 
      topics: 15, 
      completedTopics: 9,
      icon: <Code className="w-6 h-6 text-accent" />,
      color: "hsl(172, 66%, 50%)"
    },
    { 
      subject: "Machine Learning", 
      mastery: 45, 
      topics: 20, 
      completedTopics: 9,
      icon: <BrainCircuit className="w-6 h-6 text-warning" />,
      color: "hsl(38, 92%, 50%)"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Learner! 👋</h1>
          <p className="text-muted-foreground">Here's your personalized learning overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ProgressCard
            title="Overall Progress"
            value={62}
            maxValue={100}
            color="primary"
            subtitle="Across all subjects"
          />
          <ProgressCard
            title="Weekly Goal"
            value={4}
            maxValue={5}
            color="success"
            subtitle="Topics completed"
          />
          <ProgressCard
            title="Current Streak"
            value={7}
            maxValue={10}
            color="accent"
            subtitle="Days in a row"
          />
          <ProgressCard
            title="Assessments"
            value={85}
            maxValue={100}
            color="warning"
            subtitle="Average score"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Subject Mastery */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up delay-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Knowledge Map</h2>
              <Link to="/learning-path">
                <Button variant="ghost" size="sm" className="text-primary">
                  View Full Path
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <SubjectMasteryCard key={subject.subject} {...subject} />
              ))}
              
              {/* Add More Card */}
              <Link 
                to="/courses" 
                className="p-6 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="font-medium">Explore More Subjects</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-6 animate-slide-up delay-200">
            <h2 className="text-xl font-semibold text-foreground">What's Next for You</h2>
            
            <div className="space-y-3">
              <RecommendationCard
                type="next"
                title="Graph Algorithms"
                description="Build on your tree knowledge to master graph traversal techniques."
                action="Start"
                onClick={() => {}}
              />
              <RecommendationCard
                type="revise"
                title="Binary Search Trees"
                description="Your assessment showed some gaps. A quick review will help solidify this foundation."
                action="Review"
                onClick={() => {}}
              />
              <RecommendationCard
                type="ready"
                title="Dynamic Programming"
                description="You've completed all prerequisites! Ready to tackle advanced problem-solving."
                action="Begin"
                onClick={() => {}}
              />
              <RecommendationCard
                type="upcoming"
                title="Neural Networks"
                description="Complete Linear Algebra basics first to unlock this topic."
              />
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="mt-8 p-6 rounded-2xl bg-card border border-border animate-slide-up delay-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Your learning journey this week</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last 7 days</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-success font-medium">+12% improvement</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            {[
              { day: "Today", activity: "Completed Assessment: Sorting Algorithms", score: "92%", icon: Target },
              { day: "Yesterday", activity: "Studied: Hash Tables & Applications", time: "45 min", icon: BookOpen },
              { day: "2 days ago", activity: "Completed: Graph Basics Module", status: "Mastered", icon: Code },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.activity}</p>
                  <p className="text-xs text-muted-foreground">{item.day}</p>
                </div>
                {item.score && (
                  <span className="text-sm font-semibold text-success">{item.score}</span>
                )}
                {item.time && (
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                )}
                {item.status && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                    {item.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
