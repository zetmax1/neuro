import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Code2 } from "lucide-react";
import { AnswerOption } from "./AnswerOption";
import { FeedbackBox } from "./FeedbackBox";
import { QuizHeader } from "./QuizHeader";
import { DifficultyBadge } from "./DifficultyBadge";
import { saveMistakes } from "@/lib/mistakeStorage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  /** Broad topic used for grouping (e.g. "Loops", "Arrays") */
  concept: string;
  explanation: string;
  /** Optional code snippet rendered in a code block above options */
  codeSnippet?: string;
  /** Optional hint for why a commonly-chosen wrong option is wrong */
  wrongAnswerHint?: string;
}

export interface TopicBreakdown {
  topic: string;
  correct: number;
  total: number;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  /** 0-100 percentage */
  score: number;
  level: "beginner" | "intermediate" | "advanced";
  /** Legacy – per-concept breakdown map */
  conceptScores: Record<string, { correct: number; total: number }>;
  strengths: string[];
  weaknesses: string[];
  timeSpent: number;
  topicBreakdown: TopicBreakdown[];
  answeredQuestions: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    difficulty: string;
    concept: string;
  }[];
}

interface QuizEngineProps {
  questions: Question[];
  onComplete: (results: QuizResults) => void;
  adaptive?: boolean;
  title?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D", "E"];

/** Determine the most recent difficulty level from answered list */
function getAdaptiveDifficulty(
  answered: QuizResults["answeredQuestions"],
  current: Question["difficulty"],
): Question["difficulty"] {
  if (answered.length < 2) return current;
  const recent = answered.slice(-2);
  const recentCorrect = recent.filter(a => a.isCorrect).length;
  if (recentCorrect >= 2 && current !== "hard") {
    return current === "easy" ? "medium" : "hard";
  }
  if (recentCorrect <= 0 && current !== "easy") {
    return current === "hard" ? "medium" : "easy";
  }
  return current;
}

/** Build the final QuizResults object */
function buildResults(
  answered: QuizResults["answeredQuestions"],
  startTime: number,
): QuizResults {
  const conceptScores: Record<string, { correct: number; total: number }> = {};

  answered.forEach(aq => {
    if (!conceptScores[aq.concept]) {
      conceptScores[aq.concept] = { correct: 0, total: 0 };
    }
    conceptScores[aq.concept].total++;
    if (aq.isCorrect) conceptScores[aq.concept].correct++;
  });

  const topicBreakdown: TopicBreakdown[] = Object.entries(conceptScores).map(
    ([topic, scores]) => ({ topic, correct: scores.correct, total: scores.total }),
  );

  const correctCount = answered.filter(a => a.isCorrect).length;
  const score = (correctCount / answered.length) * 100;

  const hardCorrect  = answered.filter(a => a.isCorrect && a.difficulty === "hard").length;
  const mediumCorrect = answered.filter(a => a.isCorrect && a.difficulty === "medium").length;

  let level: QuizResults["level"] = "beginner";
  if (score >= 70 && hardCorrect >= 3)       level = "advanced";
  else if (score >= 50 || mediumCorrect >= 3) level = "intermediate";

  const strengths:  string[] = [];
  const weaknesses: string[] = [];

  Object.entries(conceptScores).forEach(([concept, scores]) => {
    const pct = (scores.correct / scores.total) * 100;
    if (pct >= 70) strengths.push(concept);
    else if (pct < 50) weaknesses.push(concept);
  });

  return {
    totalQuestions: answered.length,
    correctAnswers: correctCount,
    score,
    level,
    conceptScores,
    strengths,
    weaknesses,
    timeSpent: Math.floor((Date.now() - startTime) / 1000),
    topicBreakdown,
    answeredQuestions: answered,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const QuizEngine = ({
  questions: initialQuestions,
  onComplete,
  adaptive = true,
  title = "Assessment",
}: QuizEngineProps) => {
  const TOTAL = Math.min(initialQuestions.length, 10);

  const [currentIndex, setCurrentIndex]     = useState(0);
  const [selectedAnswer, setSelectedAnswer]  = useState<number | null>(null);
  const [isAnswered, setIsAnswered]          = useState(false);
  const [answered, setAnswered]              = useState<QuizResults["answeredQuestions"]>([]);
  const [difficulty, setDifficulty]          = useState<Question["difficulty"]>("medium");
  const [prevDifficulty, setPrevDifficulty]  = useState<Question["difficulty"] | null>(null);
  const [startTime]                          = useState(Date.now());
  // Used to re-trigger slide animation on question change
  const [animKey, setAnimKey]                = useState(0);

  // Pick current question
  const pool = adaptive
    ? initialQuestions.filter(q => q.difficulty === difficulty)
    : initialQuestions;

  const currentQuestion =
    pool[currentIndex % pool.length] ?? initialQuestions[currentIndex] ?? initialQuestions[0];

  const questionNumber  = answered.length + 1;
  const isLastQuestion  = answered.length + 1 >= TOTAL;

  // ── Handlers ──

  const handleAnswer = useCallback(
    (idx: number) => {
      if (isAnswered) return;
      setSelectedAnswer(idx);
      setIsAnswered(true);

      const isCorrect = idx === currentQuestion.correctAnswer;

      const entry = {
        questionId: currentQuestion.id,
        selectedAnswer: idx,
        isCorrect,
        difficulty: currentQuestion.difficulty,
        concept: currentQuestion.concept,
      };

      setAnswered(prev => {
        const next = [...prev, entry];
        // Adapt difficulty based on updated list
        if (adaptive) {
          setDifficulty(d => {
            const next_d = getAdaptiveDifficulty(next, d);
            if (next_d !== d) setPrevDifficulty(d);
            return next_d;
          });
        }
        return next;
      });
    },
    [isAnswered, currentQuestion, adaptive],
  );

  const handleNext = useCallback(() => {
    const nextAnswered = [...answered];
    // nextAnswered already has the just-answered entry (set in handleAnswer)

    if (isLastQuestion) {
      const finalResults = buildResults(nextAnswered, startTime);
      // Persist wrong answers to localStorage for Mistakes page
      const wrongOnes = nextAnswered
        .filter(a => !a.isCorrect)
        .map(a => {
          const q = initialQuestions.find(q => q.id === a.questionId);
          if (!q) return null;
          return {
            questionId: q.id,
            question: q.question,
            options: q.options,
            selectedAnswer: a.selectedAnswer,
            correctAnswer: q.correctAnswer,
            concept: q.concept,
            difficulty: q.difficulty,
            explanation: q.explanation,
            quizTitle: title,
          };
        })
        .filter(Boolean) as Parameters<typeof saveMistakes>[0];
      if (wrongOnes.length > 0) saveMistakes(wrongOnes);
      onComplete(finalResults);
      return;
    }

    setCurrentIndex(i => i + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnimKey(k => k + 1);
  }, [answered, isLastQuestion, onComplete, startTime]);

  // ── Difficulty badge ──
  const difficultyColors: Record<string, string> = {
    easy:   "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    hard:   "text-primary bg-primary/10",
  };

  const isCorrectAnswer = selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6">
      {/* Sticky-ish header */}
      <QuizHeader title={title} current={questionNumber} total={TOTAL} />

      {/* Difficulty badge — only shown when adaptive */}
      {adaptive && (
        <div className="flex justify-end -mt-2">
          <DifficultyBadge
            current={difficulty}
            previous={prevDifficulty}
            animated={prevDifficulty !== null && prevDifficulty !== difficulty}
          />
        </div>
      )}

      {/* Question card */}
      <div
        key={animKey}
        className="animate-slide-up rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6"
      >
        {/* Concept + Difficulty badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            <Brain className="w-3 h-3" />
            {currentQuestion.concept}
          </span>
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              difficultyColors[currentQuestion.difficulty],
            )}
          >
            {currentQuestion.difficulty}
          </span>
        </div>

        {/* Question text */}
        <h3 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
          {currentQuestion.question}
        </h3>

        {/* Optional code snippet */}
        {currentQuestion.codeSnippet && (
          <div className="rounded-xl overflow-hidden border border-border/60">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border/60">
              <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">code</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground bg-muted/30 leading-relaxed">
              {currentQuestion.codeSnippet}
            </pre>
          </div>
        )}

        {/* Answer options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <AnswerOption
              key={idx}
              label={LETTERS[idx]}
              text={option}
              index={idx}
              isSelected={selectedAnswer === idx}
              isCorrect={idx === currentQuestion.correctAnswer}
              isRevealed={isAnswered}
              onClick={() => handleAnswer(idx)}
              animationDelay={idx * 60}
            />
          ))}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <FeedbackBox
            isCorrect={isCorrectAnswer}
            explanation={currentQuestion.explanation}
            wrongHint={
              !isCorrectAnswer ? currentQuestion.wrongAnswerHint : undefined
            }
          />
        )}
      </div>

      {/* Next button – only visible after answering */}
      {isAnswered && (
        <div className="animate-fade-in flex justify-end">
          <Button
            onClick={handleNext}
            variant="hero"
            size="lg"
            className="gap-2 px-8"
          >
            {isLastQuestion ? "See Results" : "Next Question"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
