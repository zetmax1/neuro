import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { QuizResults } from "./QuizEngine";

interface ResultsSummaryProps {
  results: QuizResults;
  onContinue: () => void;
  onRetake: () => void;
}

export const ResultsSummary = ({ results, onContinue, onRetake }: ResultsSummaryProps) => {
  const levelConfig = {
    beginner: { color: "text-success", bg: "bg-success/10", icon: BookOpen, label: "Beginner" },
    intermediate: { color: "text-warning", bg: "bg-warning/10", icon: Target, label: "Intermediate" },
    advanced: { color: "text-primary", bg: "bg-primary/10", icon: Trophy, label: "Advanced" },
  };

  const level = levelConfig[results.level];
  const minutes = Math.floor(results.timeSpent / 60);
  const seconds = results.timeSpent % 60;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Score Card */}
      <div className="p-8 rounded-2xl bg-card border border-border text-center">
        <div className={cn("w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center", level.bg)}>
          <level.icon className={cn("w-10 h-10", level.color)} />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {Math.round(results.score)}%
        </h2>
        
        <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4", level.bg)}>
          <span className={cn("font-semibold", level.color)}>
            Level: {level.label}
          </span>
        </div>
        
        <p className="text-muted-foreground mb-6">
          You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly
        </p>

        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{minutes}m {seconds}s</span>
          </div>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-4 h-4" />
            <span>{results.correctAnswers} correct</span>
          </div>
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="w-4 h-4" />
            <span>{results.totalQuestions - results.correctAnswers} incorrect</span>
          </div>
        </div>
      </div>

      {/* Concept Breakdown */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Concept Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(results.conceptScores).map(([concept, scores]) => {
            const percentage = Math.round((scores.correct / scores.total) * 100);
            return (
              <div key={concept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{concept}</span>
                  <span className={cn(
                    percentage >= 70 ? "text-success" : percentage >= 50 ? "text-warning" : "text-destructive"
                  )}>
                    {scores.correct}/{scores.total} ({percentage}%)
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-2",
                    percentage >= 70 ? "[&>div]:bg-success" : percentage >= 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                  )} 
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        {results.strengths.length > 0 && (
          <div className="p-6 rounded-2xl bg-success/5 border border-success/20">
            <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {results.strengths.map(s => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {results.weaknesses.length > 0 && (
          <div className="p-6 rounded-2xl bg-warning/5 border border-warning/20">
            <h3 className="font-semibold text-warning mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {results.weaknesses.map(w => (
                <li key={w} className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-warning shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">📚 Personalized Recommendation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {results.level === "advanced" 
            ? "You have a strong foundation! We'll start you with advanced materials and challenging exercises."
            : results.level === "intermediate"
            ? "You have solid basics. We'll focus on strengthening your weak areas while introducing new concepts."
            : "Let's build your foundation step by step. We'll start with the fundamentals and gradually increase difficulty."}
        </p>
        {results.weaknesses.length > 0 && (
          <p className="text-sm text-muted-foreground">
            <strong>Priority focus:</strong> {results.weaknesses.slice(0, 2).join(", ")}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onRetake}>
          Retake Assessment
        </Button>
        <Button variant="hero" onClick={onContinue}>
          Start Learning
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
