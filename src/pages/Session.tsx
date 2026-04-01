import { useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { QuizEngine, QuizResults } from "@/components/assessment/QuizEngine";
import { SessionStepper, SessionPhase } from "@/components/session/SessionStepper";
import { LessonCard } from "@/components/session/LessonCard";
import { sessionContent, nextTopicMap } from "@/components/session/sessionContent";
import { dataStructuresQuestions, algorithmsQuestions, loopsQuestions } from "@/components/assessment/sampleQuestions";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Map topic key → question set
const questionMap: Record<string, typeof loopsQuestions> = {
  loops:             loopsQuestions,
  "data-structures": dataStructuresQuestions,
  algorithms:        algorithmsQuestions,
};

const Session = () => {
  const [searchParams] = useSearchParams();
  const topicKey = searchParams.get("topic") || "loops";

  const content  = sessionContent[topicKey] ?? sessionContent["loops"];
  const questions = (questionMap[topicKey] ?? loopsQuestions).slice(0, 5); // 5-question mini quiz
  const next     = nextTopicMap[topicKey];

  const [phase, setPhase]     = useState<SessionPhase>("intro");
  const [results, setResults] = useState<QuizResults | null>(null);

  const handleQuizComplete = useCallback((r: QuizResults) => {
    setResults(r);
    setPhase("results");
  }, []);

  const score = results ? Math.round(results.score) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          back to dashboard
        </Link>

        {/* Session label + stepper */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                study session
              </p>
              <h1 className="text-2xl font-semibold text-foreground">{content.topic}</h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {content.duration}
            </div>
          </div>
          <SessionStepper current={phase} />
        </div>

        {/* ── INTRO ─────────────────────────────────────── */}
        {phase === "intro" && (
          <div className="animate-slide-up space-y-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h2 className="text-base font-semibold text-foreground">{content.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.summary}</p>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  in this session
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    read a short explanation with examples
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    answer {questions.length} quick questions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    get a personalised recommendation for what to study next
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setPhase("lesson")} className="gap-2">
                start session
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── LESSON ────────────────────────────────────── */}
        {phase === "lesson" && (
          <div className="animate-slide-up space-y-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h2 className="text-base font-semibold text-foreground mb-4">{content.title}</h2>
              <LessonCard content={content} />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setPhase("intro")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← back
              </button>
              <Button onClick={() => setPhase("quiz")} className="gap-2">
                i'm ready, test me
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── QUIZ ──────────────────────────────────────── */}
        {phase === "quiz" && (
          <div className="animate-slide-up">
            <QuizEngine
              questions={questions}
              onComplete={handleQuizComplete}
              adaptive={false}
              title={`${content.topic} – mini quiz`}
            />
          </div>
        )}

        {/* ── RESULTS ───────────────────────────────────── */}
        {phase === "results" && results && (
          <div className="animate-slide-up space-y-5">
            {/* Score summary */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">session complete</h2>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive",
                )}>
                  {score}%
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {score >= 80 && "solid understanding — you're ready to move on."}
                {score >= 60 && score < 80 && "good progress. a little more practice will help."}
                {score < 60 && "this topic needs more time. review the lesson and try again."}
              </p>

              {/* Per-topic bars */}
              {results.topicBreakdown.length > 0 && (
                <div className="space-y-2 pt-1">
                  {results.topicBreakdown.map((t) => {
                    const pct = Math.round((t.correct / t.total) * 100);
                    return (
                      <div key={t.topic}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{t.topic}</span>
                          <span className={cn(
                            pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-destructive"
                          )}>{t.correct}/{t.total}</span>
                        </div>
                        <div className="h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-destructive",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* What you learned */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  what you covered
                </p>
                <ul className="space-y-1">
                  {content.keyPoints.slice(0, 3).map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setPhase("quiz")} className="gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                retry quiz
              </Button>
              <Button onClick={() => setPhase("next")} className="flex-1 gap-2">
                see what's next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── NEXT ──────────────────────────────────────── */}
        {phase === "next" && next && (
          <div className="animate-slide-up space-y-5">
            <div className="p-6 rounded-xl border border-primary/25 bg-primary/5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                recommended next
              </p>
              <h2 className="text-xl font-semibold text-foreground">{next.label}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{next.reason}</p>

              <div className="pt-2 flex items-center gap-3">
                <Link to={`/session?topic=${next.key}`}>
                  <Button className="gap-2">
                    start {next.label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-muted-foreground">
                    back to dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Also review mistakes if score < 70 */}
            {results && score < 70 && (
              <Link to="/mistakes">
                <div className="flex items-center justify-between p-4 rounded-xl border border-warning/25 bg-warning/5 hover:bg-warning/8 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">review your mistakes first</p>
                    <p className="text-xs text-muted-foreground">
                      you got {results.totalQuestions - results.correctAnswers} questions wrong this session
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-warning" />
                </div>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Session;
