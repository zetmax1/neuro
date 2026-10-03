import Header from "@/components/layout/Header";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, Calendar, TrendingUp, BookOpen, Target, Clock,
  Award, Flame, BarChart3, ArrowRight, LogOut, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const weeklyActivity = [
  { day: "Mon", hours: 1.5, topics: 2 },
  { day: "Tue", hours: 2.0, topics: 3 },
  { day: "Wed", hours: 0.5, topics: 1 },
  { day: "Thu", hours: 1.8, topics: 2 },
  { day: "Fri", hours: 2.5, topics: 4 },
  { day: "Sat", hours: 3.0, topics: 3 },
  { day: "Sun", hours: 1.0, topics: 1 },
];

const masteryData = [
  { subject: "Data Structures", mastery: 78, change: +5 },
  { subject: "Algorithms", mastery: 62, change: +8 },
  { subject: "Machine Learning", mastery: 45, change: +12 },
  { subject: "Fundamentals", mastery: 92, change: +2 },
];

const achievements = [
  { title: "First assessment", description: "Completed your first placement test", icon: Target, earned: true },
  { title: "7-day streak", description: "Studied for 7 consecutive days", icon: Flame, earned: true },
  { title: "Topic master", description: "Achieved 90%+ mastery on a topic", icon: Award, earned: true },
  { title: "Deep diver", description: "Spent 10+ hours on a single subject", icon: BookOpen, earned: false },
  { title: "Speed learner", description: "Complete 5 topics in one day", icon: TrendingUp, earned: false },
];

const recentHistory = [
  { action: "Assessment completed", detail: "Sorting Algorithms — 92%", time: "2 hours ago" },
  { action: "Topic completed", detail: "Hash Tables & Applications", time: "Yesterday" },
  { action: "Assessment completed", detail: "Graph Basics — 78%", time: "3 days ago" },
  { action: "Topic started", detail: "Dynamic Programming", time: "4 days ago" },
];

const Profile = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const maxHours = Math.max(...weeklyActivity.map(d => d.hours));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || "L"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user?.name || "Learner"}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "today"}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Sign out
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up delay-100">
          {[
            { label: "Total XP", value: "2,450", icon: Award, color: "text-primary" },
            { label: "Streak", value: "7 days", icon: Flame, color: "text-warning" },
            { label: "Topics Done", value: "28", icon: BookOpen, color: "text-success" },
            { label: "Study Hours", value: "42h", icon: Clock, color: "text-accent" },
          ].map(stat => (
            <div key={stat.label} className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — mastery & activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subject mastery */}
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-200">
              <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Subject mastery
              </h2>
              <div className="space-y-4">
                {masteryData.map(s => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{s.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{s.mastery}%</span>
                        <span className="text-xs text-success font-medium">+{s.change}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          s.mastery >= 80 ? "bg-success" : s.mastery >= 50 ? "bg-primary" : "bg-warning"
                        )}
                        style={{ width: `${s.mastery}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly activity */}
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-300">
              <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Weekly activity
              </h2>
              <div className="flex items-end gap-3 h-40">
                {weeklyActivity.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-28">
                      <span className="text-xs font-medium text-foreground mb-1">{d.hours}h</span>
                      <div
                        className="w-full rounded-lg bg-primary/80 transition-all duration-500"
                        style={{ height: `${(d.hours / maxHours) * 100}%`, minHeight: "8px" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning history */}
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-400">
              <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent history
              </h2>
              <div className="space-y-3">
                {recentHistory.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — achievements */}
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up delay-200">
              <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                Achievements
              </h2>
              <div className="space-y-3">
                {achievements.map((a, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      a.earned ? "bg-warning/5 border border-warning/20" : "bg-muted/50 opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      a.earned ? "bg-warning/10" : "bg-muted"
                    )}>
                      <a.icon className={cn("w-5 h-5", a.earned ? "text-warning" : "text-muted-foreground")} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-sm font-medium", a.earned ? "text-foreground" : "text-muted-foreground")}>{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                    {a.earned && (
                      <Badge variant="secondary" className="text-xs shrink-0">Earned</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
