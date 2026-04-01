// Shared localStorage utility for storing quiz mistakes
// Used by: QuizEngine (write) → Mistakes page (read)

export interface StoredMistake {
  id: string;           // unique: questionId + timestamp
  questionId: string;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  concept: string;      // topic group e.g. "While Loops"
  difficulty: string;
  explanation: string;
  quizTitle: string;    // e.g. "Loops Basics Assessment"
  timestamp: number;
}

const STORAGE_KEY = "neuro_mistakes";
const MAX_STORED = 100; // cap to avoid bloating localStorage

export function saveMistakes(
  mistakes: Omit<StoredMistake, "id" | "timestamp">[],
): void {
  const existing = loadMistakes();
  const now = Date.now();

  const newEntries: StoredMistake[] = mistakes.map((m, i) => ({
    ...m,
    id: `${m.questionId}-${now}-${i}`,
    timestamp: now,
  }));

  // Merge new at front, cap size
  const merged = [...newEntries, ...existing].slice(0, MAX_STORED);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Quota exceeded — clear and retry
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries.slice(0, 20)));
  }
}

export function loadMistakes(): StoredMistake[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredMistake[]) : [];
  } catch {
    return [];
  }
}

export function clearMistakes(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTopics(mistakes: StoredMistake[]): string[] {
  const topics = new Set(mistakes.map((m) => m.concept));
  return Array.from(topics).sort();
}
