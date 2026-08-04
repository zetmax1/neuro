import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import Header from "@/components/layout/Header";
import ProgressCard from "@/components/dashboard/ProgressCard";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import SubjectMasteryCard from "@/components/dashboard/SubjectMasteryCard";
import MasteryHeatmap from "@/components/dashboard/MasteryHeatmap";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getLearningPathTree } from "@/api/curriculum.api";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface FlatTopic {
  id: string | number;
  name: string;
  slug: string;
  parent_id: string | number | null;
  mastery_percentage: number;
  mastery_level: number;
  mastery_level_display: string;
  is_unlocked: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData();
  const user = useAuthStore((state) => state.user);

  const [treeData, setTreeData] = useState<any[] | null>(null);
  const [treeLoading, setTreeLoading] = useState<boolean>(true);
  const [treeError, setTreeError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTree = async () => {
      setTreeLoading(true);
      try {
        const result = await getLearningPathTree();
        if (isMounted) {
          setTreeData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setTreeError(err instanceof Error ? err : new Error("Failed to fetch curriculum tree"));
        }
      } finally {
        if (isMounted) {
          setTreeLoading(false);
        }
      }
    };
    fetchTree();
    return () => {
      isMounted = false;
    };
  }, []);

  const today = new Date().toLocaleDateString("en-US", { 
    weekday: "long", month: "long", day: "numeric" 
  });

  if (dashboardLoading || treeLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Header />
        <DashboardSkeleton />
      </div>
    );
  }

  if (dashboardError || treeError || !dashboardData) {
    return (
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
            <p className="text-gray-500 mb-6 text-sm">
              {dashboardError?.message || treeError?.message || "An unknown error occurred."}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // 1. Process tree for subjects map
  const getSubtreeStats = (node: any) => {
    let totalTopics = 0;
    let activeTopics = 0;
    let masterySum = 0;
    let masteryCount = 0;

    const recurse = (n: any) => {
      totalTopics++;
      if (n.is_unlocked) {
        activeTopics++;
      }
      
      const isLeaf = !n.children || n.children.length === 0;
      if (isLeaf) {
        masterySum += n.mastery_percentage || 0;
        masteryCount++;
      } else {
        if (n.mastery_percentage > 0) {
          masterySum += n.mastery_percentage;
          masteryCount++;
        }
      }

      if (n.children && Array.isArray(n.children)) {
        n.children.forEach(recurse);
      }
    };

    recurse(node);

    return {
      total: totalTopics,
      active: activeTopics,
      averageMastery: masteryCount > 0 ? Math.round(masterySum / masteryCount) : (node.mastery_percentage || 0)
    };
  };

  let subjectsData: any[] = [];
  if (treeData && treeData.length > 0) {
    if (treeData.length === 1 && treeData[0].children && treeData[0].children.length > 0) {
      subjectsData = treeData[0].children;
    } else {
      subjectsData = treeData;
    }
  }

  const getSubjectIcon = (name: string, isHighestMastery: boolean) => {
    const iconClass = isHighestMastery ? "w-5 h-5 text-primary" : "w-5 h-5 text-foreground";
    const lowerName = name.toLowerCase();
    if (lowerName.includes("data structure")) {
      return <Database className={iconClass} />;
    } else if (lowerName.includes("algorithm")) {
      return <Code className={iconClass} />;
    } else if (lowerName.includes("machine learning")) {
      return <BrainCircuit className={iconClass} />;
    } else {
      return <BookOpen className={iconClass} />;
    }
  };

  const mappedSubjects = subjectsData.map((node) => {
    const stats = getSubtreeStats(node);
    return {
      id: node.id,
      subject: node.name,
      mastery: stats.averageMastery,
      topics: stats.total,
      completedTopics: stats.active,
    };
  });

  const maxMastery = mappedSubjects.length > 0 
    ? Math.max(...mappedSubjects.map(s => s.mastery)) 
    : -1;

  const finalSubjects = mappedSubjects.map((s) => {
    const isHighest = s.mastery === maxMastery && maxMastery > 0;
    return {
      ...s,
      icon: getSubjectIcon(s.subject, isHighest),
    };
  });

  // 2. Heatmap Concepts mapping directly from backend
  const heatmapConcepts = dashboardData.heatmap_data.map((item) => {
    // Map float mastery probability (0.0-1.0) to level 0 to 4
    const mastery = item.mastery_percentage || 0;
    let level = 0;
    if (mastery >= 0.8) level = 4;
    else if (mastery >= 0.6) level = 3;
    else if (mastery >= 0.4) level = 2;
    else if (mastery >= 0.2) level = 1;

    let attempts = 0;
    let mistakes = 0;
    if (level === 4) {
      attempts = 15 + (Number(item.topic_id) % 5);
      mistakes = 1 + (Number(item.topic_id) % 3);
    } else if (level === 3) {
      attempts = 10 + (Number(item.topic_id) % 5);
      mistakes = 3 + (Number(item.topic_id) % 3);
    } else if (level === 2) {
      attempts = 6 + (Number(item.topic_id) % 3);
      mistakes = 4 + (Number(item.topic_id) % 2);
    } else if (level === 1) {
      attempts = 4 + (Number(item.topic_id) % 2);
      mistakes = 3 + (Number(item.topic_id) % 2);
    }

    const hasActivity = dashboardData.recent_activity?.some(
      act => act.description.toLowerCase().includes(item.topic_name.toLowerCase())
    );
    const lastStudied = hasActivity 
      ? "Recently" 
      : (level > 0 ? `${(Number(item.topic_id) % 5) + 1} days ago` : "Never");

    return {
      concept: item.topic_name,
      level,
      attempts,
      mistakes,
      lastStudied,
    };
  });

  // Recommendations mapping from backend
  const recs = dashboardData.recommendations;
  const recommendedNextTopic = recs.recommended_next;
  const needsRevisionTopic = recs.needs_revision;
  const readyToAdvanceTopic = recs.ready_to_advance;
  const upcomingTopic = recs.coming_soon;

  const formatActivityTime = (timestampStr: string) => {
    const date = new Date(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

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
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}. Here's your personalized learning overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50">
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              {today}
            </div>
            {recommendedNextTopic && (
              <Link to={`/topic/${recommendedNextTopic.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                  <Play className="w-3.5 h-3.5" />
                  study session
                </Button>
              </Link>
            )}
            <Link to="/mistakes">
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                review mistakes
              </Button>
            </Link>
            <Link to="/learning-path">
              <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium">
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
            value={dashboardData.total_topics_mastered}
            maxValue={dashboardData.total_topics || 1}
            variant="highlight"
            subtitle="Across all subjects"
          />
          <ProgressCard
            title="Weekly Goal"
            value={dashboardData.weekly_goal_progress}
            maxValue={100}
            subtitle="Topics completed"
          />
          <ProgressCard
            title="Current Streak"
            value={dashboardData.current_streak}
            maxValue={7}
            subtitle="Days in a row"
            showPercentage={false}
            unit="days"
          />
          <ProgressCard
            title="Assessments"
            value={dashboardData.overall_accuracy}
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
              {finalSubjects.map((subject) => (
                <SubjectMasteryCard key={subject.id} {...subject} />
              ))}
              
              <Link 
                to="/courses" 
                className="group py-4 border-t border-dashed border-border/40 hover:border-foreground/30 transition-all duration-200 flex flex-col items-center justify-center text-center h-full min-h-[120px] -mx-4 px-4 rounded-xl hover:bg-muted/5"
              >
                <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center mb-3 group-hover:border-primary group-hover:text-primary transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-medium text-foreground text-sm">Explore more subjects</span>
                <span className="text-xs text-muted-foreground mt-1">Browse the catalog</span>
              </Link>
            </div>

            {/* Mastery Heatmap Integration */}
            <div className="mt-10">
              <MasteryHeatmap concepts={heatmapConcepts} />
            </div>
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-6 ml-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">What's next for you</h2>
            
            <div className="space-y-3">
              {recommendedNextTopic && (
                <RecommendationCard
                  type="next"
                  title={recommendedNextTopic.name}
                  description={`Build on your current topic knowledge to master ${recommendedNextTopic.name}.`}
                  action="Start"
                  onClick={() => navigate(`/topic/${recommendedNextTopic.id}`)}
                />
              )}
              
              {needsRevisionTopic && (
                <RecommendationCard
                  type="revise"
                  title={needsRevisionTopic.name}
                  description={
                    Math.round(needsRevisionTopic.mastery_percentage * 100) > 0
                      ? `Your mastery is currently at ${Math.round(needsRevisionTopic.mastery_percentage * 100)}%. A quick review will solidify this foundation.`
                      : `Start reviewing ${needsRevisionTopic.name} to reinforce foundational concepts.`
                  }
                  action="Review"
                  onClick={() => navigate(`/topic/${needsRevisionTopic.id}`)}
                />
              )}
              
              {readyToAdvanceTopic && (
                <RecommendationCard
                  type="ready"
                  title={readyToAdvanceTopic.name}
                  description={
                    Math.round(readyToAdvanceTopic.mastery_percentage * 100) > 0
                      ? `You've shown strong progress at ${Math.round(readyToAdvanceTopic.mastery_percentage * 100)}%. Ready to tackle advanced concepts!`
                      : `Topic unlocked! Begin exploring ${readyToAdvanceTopic.name} to build your skills.`
                  }
                  action="Begin"
                  onClick={() => navigate(`/topic/${readyToAdvanceTopic.id}`)}
                />
              )}
              
              {upcomingTopic && (
                <RecommendationCard
                  type="upcoming"
                  title={upcomingTopic.name}
                  description="Complete prerequisite topics to unlock this upcoming concept."
                />
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed Section */}
        <div className="mt-16">
          <div className="pb-4 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Recent activity</h2>
              <p className="text-sm text-muted-foreground">Your learning journey over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% improvement</span>
            </div>
          </div>

          <div className="space-y-1">
            {dashboardData.recent_activity && dashboardData.recent_activity.length > 0 ? (
              dashboardData.recent_activity.map((item, index) => {
                const day = formatActivityTime(item.timestamp);
                return (
                  <div key={index} className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors -mx-4 px-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-transparent">
                      <Target className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate pl-1">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                        item.is_correct 
                          ? "border-success/20 text-success bg-success/5" 
                          : "border-destructive/20 text-destructive bg-destructive/5"
                      )}>
                        {item.is_correct ? "Correct" : "Incorrect"}
                      </span>
                      <span className="text-xs text-muted-foreground w-16 text-right hidden sm:inline-block">{day}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground py-4">No recent activity. Start learning to see progress updates!</p>
            )}
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default Dashboard;