import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { QuizEngine, QuizResults } from "@/components/assessment/QuizEngine";
import { ResultsSummary } from "@/components/assessment/ResultsSummary";
import { dataStructuresQuestions, algorithmsQuestions } from "@/components/assessment/sampleQuestions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Target, Clock, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

type AssessmentState = "intro" | "quiz" | "results";

const Assessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "placement"; // placement | topic
  const topic = searchParams.get("topic") || "data-structures";
  
  const [state, setState] = useState<AssessmentState>("intro");
  const [results, setResults] = useState<QuizResults | null>(null);

  const topicConfig = {
    "data-structures": {
      title: "Data Structures",
      questions: dataStructuresQuestions,
      description: "Arrays, Linked Lists, Trees, Graphs, Hash Tables",
    },
    "algorithms": {
      title: "Algorithms",
      questions: algorithmsQuestions,
      description: "Sorting, Searching, Dynamic Programming, Graph Algorithms",
    },
  };

  const currentTopic = topicConfig[topic as keyof typeof topicConfig] || topicConfig["data-structures"];

  const handleQuizComplete = (quizResults: QuizResults) => {
    setResults(quizResults);
    setState("results");
  };

  const handleContinue = () => {
    // Navigate to course with the determined level
    navigate(`/course?level=${results?.level}&topic=${topic}`);
  };

  const handleRetake = () => {
    setResults(null);
    setState("quiz");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link 
          to={type === "topic" ? "/course" : "/courses"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {state === "intro" && (
          <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {type === "placement" ? "Placement assessment" : "Topic assessment"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {currentTopic.title}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-2xl bg-card border border-border text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Adaptive difficulty</h3>
                <p className="text-sm text-muted-foreground">
                  Questions adjust based on your performance
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border text-center">
                <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">15-20 Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive diagnostic assessment
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border text-center">
                <BarChart3 className="w-8 h-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Personalized path</h3>
                <p className="text-sm text-muted-foreground">
                  Get content matched to your level
                </p>
              </div>
            </div>

            {/* What to Expect */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-3">What to expect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Questions cover: {currentTopic.description}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Difficulty increases as you answer correctly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Immediate feedback after each question
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Final report with strengths and areas to improve
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setState("quiz")}
                className="px-12"
              >
                Start assessment
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Take your time - there's no time limit per question
              </p>
            </div>
          </div>
        )}

        {state === "quiz" && (
          <QuizEngine
            questions={currentTopic.questions}
            onComplete={handleQuizComplete}
            adaptive={true}
            title={`${currentTopic.title} Assessment`}
          />
        )}

        {state === "results" && results && (
          <ResultsSummary
            results={results}
            onContinue={handleContinue}
            onRetake={handleRetake}
          />
        )}
      </main>
    </div>
  );
};

export default Assessment;
