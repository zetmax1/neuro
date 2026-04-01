import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { QuizResults } from "./QuizEngine";
import { TopicAreaCard } from "./TopicAreaCard";
import { RecommendationCard, Recommendation } from "./RecommendationCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultsSummaryProps {
  results: QuizResults;
  onContinue: () => void;
  onRetake: () => void;
}

// ─── Smart Recommendation Logic ───────────────────────────────────────────────

/** Build personalised recommendations from quiz results */
function buildRecommendations(results: QuizResults): Recommendation[] {
  const recs: Recommendation[] = [];

  // For each weak topic → Review recommendation
  results.weaknesses.slice(0, 3).forEach(topic => {
    const scores = results.conceptScores[topic];
    const wrong  = scores ? scores.total - scores.correct : 0;

    recs.push({
      action: "review",
      topic,
      reason: `You answered ${wrong} question${wrong !== 1 ? "s" : ""} incorrectly on "${topic}". Reviewing this topic will help solidify your understanding.`,
    });
  });

  // Level-based "next topic" recommendation
  if (results.level === "advanced") {
    recs.push({
      action: "next",
      topic: "Advanced Problem Solving",
      reason:
        "Your strong performance suggests you are ready for complex algorithmic challenges and real-world applications.",
      prerequisite: "Competitive Programming",
    });
  } else if (results.level === "intermediate") {
    // If there are weaknesses, suggest the first one's natural next step
    if (results.weaknesses.length > 0) {
      recs.push({
        action: "next",
        topic: `${results.weaknesses[0]} – Deep Dive`,
        reason:
          `A deeper study of "${results.weaknesses[0]}" will bridge the gap to advanced topics.`,
        prerequisite: "Advanced Algorithms",
      });
    } else {
      recs.push({
        action: "next",
        topic: "Advanced Data Structures",
        reason:
          "You've mastered the basics. The next step is exploring more complex structures like tries, segment trees, and heaps.",
        prerequisite: "Algorithm Design",
      });
    }
  } else {
    recs.push({
      action: "next",
      topic: "Fundamentals Review",
      reason:
        "Building a strong foundation is essential. We recommend revisiting core concepts before moving to intermediate topics.",
    });
  }

  return recs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ResultsSummary = ({ results, onContinue, onRetake }: ResultsSummaryProps) => {
  const minutes = Math.floor(results.timeSpent / 60);
  const seconds = results.timeSpent % 60;
  const recommendations = buildRecommendations(results);

  // Score message & colors
  const score = Math.round(results.score);
  let scoreMessage: string;
  let scoreColor: string;
  let scoreBg: string;

  if (score >= 80) {
    scoreMessage = "Excellent work! 🎉";
    scoreColor   = "text-success";
    scoreBg      = "from-success/10 to-success/5";
  } else if (score >= 60) {
    scoreMessage = "Good job! Keep it up 💪";
    scoreColor   = "text-primary";
    scoreBg      = "from-primary/10 to-primary/5";
  } else if (score >= 40) {
    scoreMessage = "Needs improvement 📖";
    scoreColor   = "text-warning";
    scoreBg      = "from-warning/10 to-warning/5";
  } else {
    scoreMessage = "Let's review together 🔍";
    scoreColor   = "text-destructive";
    scoreBg      = "from-destructive/10 to-destructive/5";
  }

  const levelConfig = {
    beginner:     { label: "Beginner",     color: "text-success",     bg: "bg-success/10"  },
    intermediate: { label: "Intermediate", color: "text-warning",     bg: "bg-warning/10"  },
    advanced:     { label: "Advanced",     color: "text-primary",     bg: "bg-primary/10"  },
  };
  const level = levelConfig[results.level];

  const strongTopics = results.topicBreakdown.filter(
    t => (t.correct / t.total) * 100 >= 70,
  );
  const weakTopics = results.topicBreakdown.filter(
    t => (t.correct / t.total) * 100 < 50,
  );
  const avgTopics = results.topicBreakdown.filter(
    t => {
      const pct = (t.correct / t.total) * 100;
      return pct >= 50 && pct < 70;
    },
  );

  return (
    <div className="space-y-6 animate-slide-up pb-8">

      {/* ── Score Card ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-3xl border border-border p-8 text-center bg-gradient-to-br",
          scoreBg,
        )}
      >
        {/* Big score */}
        <div className="mb-4">
          <span className={cn("text-7xl font-bold tabular-nums", scoreColor)}>
            {score}
          </span>
          <span className="text-3xl font-bold text-muted-foreground">/100</span>
        </div>

        <p className="text-lg font-semibold text-foreground mb-1">{scoreMessage}</p>
        <p className="text-sm text-muted-foreground mb-5">
          You answered{" "}
          <span className="font-semibold text-foreground">{results.correctAnswers}</span>{" "}
          out of{" "}
          <span className="font-semibold text-foreground">{results.totalQuestions}</span>{" "}
          questions correctly
        </p>

        {/* Level badge */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-sm mb-6",
            level.bg,
            level.color,
          )}
        >
          <Trophy className="w-4 h-4" />
          {level.label} Level
        </div>

        {/* Quick stats row */}
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="font-semibold text-success">{results.correctAnswers}</span>
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="font-semibold text-destructive">
              {results.totalQuestions - results.correctAnswers}
            </span>
            <span className="text-xs text-muted-foreground">Incorrect</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {minutes}m {seconds}s
            </span>
            <span className="text-xs text-muted-foreground">Time</span>
          </div>
        </div>
      </div>

      {/* ── Strong & Weak Areas ──────────────────────────────────── */}
      {(strongTopics.length > 0 || weakTopics.length > 0 || avgTopics.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Topic Breakdown
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Strong areas */}
            {strongTopics.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">Strong Areas</span>
                </div>
                {strongTopics.map((t, i) => (
                  <TopicAreaCard
                    key={t.topic}
                    topic={t.topic}
                    correct={t.correct}
                    total={t.total}
                    variant="strong"
                    animationDelay={i * 80}
                  />
                ))}
              </div>
            )}

            {/* Weak + average areas */}
            {(weakTopics.length > 0 || avgTopics.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">Needs Work</span>
                </div>
                {[...weakTopics, ...avgTopics].map((t, i) => (
                  <TopicAreaCard
                    key={t.topic}
                    topic={t.topic}
                    correct={t.correct}
                    total={t.total}
                    variant="weak"
                    animationDelay={i * 80}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recommendations ─────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What You Should Learn Next
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} recommendation={rec} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onRetake}
          className="flex-1 gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </Button>
        <Button
          variant="hero"
          onClick={onContinue}
          className="flex-1 gap-2"
        >
          Start Learning
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
