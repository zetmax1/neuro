import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock,
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  concept: string;
  explanation: string;
}

interface QuizEngineProps {
  questions: Question[];
  onComplete: (results: QuizResults) => void;
  adaptive?: boolean;
  title?: string;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  level: "beginner" | "intermediate" | "advanced";
  conceptScores: Record<string, { correct: number; total: number }>;
  strengths: string[];
  weaknesses: string[];
  timeSpent: number;
  answeredQuestions: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    difficulty: string;
    concept: string;
  }[];
}

export const QuizEngine = ({ 
  questions: initialQuestions, 
  onComplete, 
  adaptive = true,
  title = "Assessment"
}: QuizEngineProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<QuizResults["answeredQuestions"]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Filter questions based on adaptive difficulty
  const availableQuestions = adaptive 
    ? initialQuestions.filter(q => q.difficulty === currentDifficulty)
    : initialQuestions;
  
  const currentQuestion = availableQuestions[currentIndex % availableQuestions.length] || initialQuestions[currentIndex];
  const totalToAnswer = Math.min(15, initialQuestions.length); // Comprehensive: 15-20 questions
  const progress = (answeredQuestions.length / totalToAnswer) * 100;

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case "easy": return "text-success bg-success/10";
      case "medium": return "text-warning bg-warning/10";
      case "hard": return "text-destructive bg-destructive/10";
      default: return "text-muted-foreground bg-secondary";
    }
  };

  const adjustDifficulty = (isCorrect: boolean) => {
    if (!adaptive) return;
    
    // Look at last 3 answers
    const recentAnswers = [...answeredQuestions.slice(-2), { isCorrect }];
    const recentCorrect = recentAnswers.filter(a => a.isCorrect).length;
    
    if (recentCorrect >= 2 && currentDifficulty !== "hard") {
      setCurrentDifficulty(currentDifficulty === "easy" ? "medium" : "hard");
    } else if (recentCorrect <= 1 && currentDifficulty !== "easy") {
      setCurrentDifficulty(currentDifficulty === "hard" ? "medium" : "easy");
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      difficulty: currentQuestion.difficulty,
      concept: currentQuestion.concept,
    }]);

    adjustDifficulty(isCorrect);
  };

  const handleNext = () => {
    if (answeredQuestions.length >= totalToAnswer) {
      // Calculate results
      const conceptScores: Record<string, { correct: number; total: number }> = {};
      
      answeredQuestions.forEach(aq => {
        if (!conceptScores[aq.concept]) {
          conceptScores[aq.concept] = { correct: 0, total: 0 };
        }
        conceptScores[aq.concept].total++;
        if (aq.isCorrect) conceptScores[aq.concept].correct++;
      });

      const correctCount = answeredQuestions.filter(a => a.isCorrect).length;
      const score = (correctCount / answeredQuestions.length) * 100;
      
      // Determine level based on score and difficulty of correct answers
      const hardCorrect = answeredQuestions.filter(a => a.isCorrect && a.difficulty === "hard").length;
      const mediumCorrect = answeredQuestions.filter(a => a.isCorrect && a.difficulty === "medium").length;
      
      let level: "beginner" | "intermediate" | "advanced" = "beginner";
      if (score >= 70 && hardCorrect >= 3) {
        level = "advanced";
      } else if (score >= 50 || mediumCorrect >= 3) {
        level = "intermediate";
      }

      // Identify strengths and weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      Object.entries(conceptScores).forEach(([concept, scores]) => {
        const percentage = (scores.correct / scores.total) * 100;
        if (percentage >= 70) strengths.push(concept);
        else if (percentage < 50) weaknesses.push(concept);
      });

      onComplete({
        totalQuestions: answeredQuestions.length,
        correctAnswers: correctCount,
        score,
        level,
        conceptScores,
        strengths,
        weaknesses,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        answeredQuestions,
      });
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
    }
  };

  const getDifficultyTrend = () => {
    if (answeredQuestions.length < 2) return null;
    const lastDiff = answeredQuestions[answeredQuestions.length - 1]?.difficulty;
    const prevDiff = answeredQuestions[answeredQuestions.length - 2]?.difficulty;
    
    const diffOrder = { easy: 0, medium: 1, hard: 2 };
    const diff = (diffOrder[lastDiff as keyof typeof diffOrder] || 0) - (diffOrder[prevDiff as keyof typeof diffOrder] || 0);
    
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {answeredQuestions.length + 1} of {totalToAnswer}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {adaptive && (
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-2 py-1 rounded-full", getDifficultyColor(currentDifficulty))}>
                {currentDifficulty}
              </span>
              {getDifficultyTrend()}
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{Math.floor((Date.now() - startTime) / 60000)}m</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className={cn("text-xs px-2 py-0.5 rounded-full mb-2 inline-block", getDifficultyColor(currentQuestion.difficulty))}>
              {currentQuestion.concept}
            </span>
            <h3 className="text-lg font-medium text-foreground">{currentQuestion.question}</h3>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            const showAsCorrect = showFeedback && isCorrect;
            const showAsWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3",
                  !showFeedback && "hover:border-primary hover:shadow-md cursor-pointer",
                  showFeedback && "cursor-default",
                  showAsCorrect && "bg-success/10 border-success",
                  showAsWrong && "bg-destructive/10 border-destructive",
                  isSelected && !showFeedback && "border-primary bg-primary/5",
                  !isSelected && !showAsCorrect && !showAsWrong && "border-border bg-background"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                  showAsCorrect && "bg-success text-white",
                  showAsWrong && "bg-destructive text-white",
                  !showAsCorrect && !showAsWrong && "bg-secondary text-foreground"
                )}>
                  {showAsCorrect ? <CheckCircle2 className="w-5 h-5" /> : 
                   showAsWrong ? <XCircle className="w-5 h-5" /> : 
                   String.fromCharCode(65 + idx)}
                </div>
                <span className={cn(
                  "flex-1",
                  showAsCorrect && "text-success font-medium",
                  showAsWrong && "text-destructive"
                )}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={cn(
            "mt-6 p-4 rounded-xl",
            selectedAnswer === currentQuestion.correctAnswer 
              ? "bg-success/10 border border-success/20" 
              : "bg-warning/10 border border-warning/20"
          )}>
            <p className="font-medium mb-2">
              {selectedAnswer === currentQuestion.correctAnswer ? "✨ Excellent!" : "💡 Let's learn from this"}
            </p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      {showFeedback && (
        <div className="flex justify-end">
          <Button onClick={handleNext} variant="hero">
            {answeredQuestions.length >= totalToAnswer ? "See Results" : "Next Question"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
