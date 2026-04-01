import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { MistakeCard } from "@/components/mistakes/MistakeCard";
import { TopicFilter } from "@/components/mistakes/TopicFilter";
import { loadMistakes, clearMistakes, getTopics, StoredMistake } from "@/lib/mistakeStorage";
import { ArrowLeft, RotateCcw, Trash2, BookOpen } from "lucide-react";

// ── seed some demo mistakes so the page is never empty ──────────────────────
const DEMO_MISTAKES: StoredMistake[] = [
  {
    id: "demo-1",
    questionId: "loop-4",
    question: "What is the output of this while loop?\n\nlet count = 5;\nwhile (count > 2) { count--; }\nconsole.log(count);",
    options: ["5", "3", "2", "0"],
    selectedAnswer: 1,
    correctAnswer: 2,
    concept: "While Loops",
    difficulty: "easy",
    explanation: "The loop decrements count until count > 2 is false. It stops when count = 2, so the output is 2.",
    quizTitle: "Loops Basics Assessment",
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "demo-2",
    questionId: "loop-7",
    question: "How many times does 'x' get printed?\n\nfor (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 2; j++) {\n    console.log('x');\n  }\n}",
    options: ["3", "5", "6", "9"],
    selectedAnswer: 1,
    correctAnswer: 2,
    concept: "Nested Loops",
    difficulty: "medium",
    explanation: "Outer runs 3 times × inner runs 2 times = 6 total prints.",
    quizTitle: "Loops Basics Assessment",
    timestamp: Date.now() - 1000 * 60 * 28,
  },
  {
    id: "demo-3",
    questionId: "ds-1",
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    selectedAnswer: 1,
    correctAnswer: 0,
    concept: "Arrays",
    difficulty: "easy",
    explanation: "Array index access is O(1) because memory addresses are computed directly.",
    quizTitle: "Data Structures Assessment",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "demo-4",
    questionId: "ds-7",
    question: "What is the average time complexity of searching in a hash table?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    selectedAnswer: 2,
    correctAnswer: 0,
    concept: "Hash Tables",
    difficulty: "medium",
    explanation: "Hash tables provide O(1) average case search via direct addressing with the hash function.",
    quizTitle: "Data Structures Assessment",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "demo-5",
    questionId: "loop-6",
    question: "Which of these while loops creates an infinite loop?",
    options: [
      "let i = 0; while (i < 5) { i++; }",
      "let i = 0; while (i < 5) { }",
      "let i = 10; while (i > 0) { i--; }",
      "let i = 5; while (i === 0) { i--; }",
    ],
    selectedAnswer: 0,
    correctAnswer: 1,
    concept: "While Loops",
    difficulty: "medium",
    explanation: "Option B never increments i, so i < 5 is always true — infinite loop.",
    quizTitle: "Loops Basics Assessment",
    timestamp: Date.now() - 1000 * 60 * 25,
  },
];

const Mistakes = () => {
  const [filterTopic, setFilterTopic] = useState("all");
  const [cleared, setCleared]         = useState(false);

  // Merge real stored mistakes with demo ones (demo shown if nothing stored)
  const stored = loadMistakes();
  const allMistakes: StoredMistake[] = stored.length > 0 ? stored : DEMO_MISTAKES;

  const topics = getTopics(allMistakes);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    allMistakes.forEach(m => {
      map[m.concept] = (map[m.concept] ?? 0) + 1;
    });
    return map;
  }, [allMistakes]);

  const visible = useMemo(() => {
    if (filterTopic === "all") return allMistakes;
    return allMistakes.filter(m => m.concept === filterTopic);
  }, [allMistakes, filterTopic]);

  // Group visible by concept
  const grouped = useMemo(() => {
    const map = new Map<string, StoredMistake[]>();
    visible.forEach(m => {
      if (!map.has(m.concept)) map.set(m.concept, []);
      map.get(m.concept)!.push(m);
    });
    return Array.from(map.entries());
  }, [visible]);

  const handleClear = () => {
    clearMistakes();
    setCleared(true);
  };

  if (cleared) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-4">
          <p className="text-4xl">✓</p>
          <h2 className="text-lg font-semibold text-foreground">all cleared</h2>
          <p className="text-sm text-muted-foreground">your mistake history has been wiped. keep going!</p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-4">back to dashboard</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          back
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">mistake review</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {allMistakes.length} wrong answer{allMistakes.length !== 1 ? "s" : ""} · turn them into learning
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Retry mistakes — navigates to assessment with just the wrong question IDs */}
            <Link to="/assessment?topic=loops">
              <Button size="sm" className="gap-1.5 h-8 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                retry mistakes
              </Button>
            </Link>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              clear
            </button>
          </div>
        </div>

        {/* Filter row */}
        {topics.length > 1 && (
          <div className="mb-6">
            <TopicFilter
              topics={topics}
              selected={filterTopic}
              onChange={setFilterTopic}
              counts={counts}
            />
          </div>
        )}

        {/* Content */}
        {grouped.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">no mistakes in this topic</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([concept, mistakes]) => (
              <div key={concept}>
                {/* Topic section header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-foreground">{concept}</span>
                  <span className="text-xs text-muted-foreground">
                    {mistakes.length} mistake{mistakes.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3">
                  {mistakes.map((m) => (
                    <MistakeCard key={m.id} {...m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom retry button */}
        {grouped.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border flex justify-center">
            <Link to="/assessment?topic=loops">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                retry all mistakes as a quiz
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Mistakes;
