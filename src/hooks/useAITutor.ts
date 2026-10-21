import { useState, useCallback } from "react";

type Message = { role: "user" | "assistant"; content: string };
type TutorMode = "socratic" | "visual" | "mistake-analysis" | "study-buddy" | "default";

interface LearnerContext {
  currentTopic?: string;
  learnerLevel?: string;
  mistakePatterns?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

/**
 * The AI tutor is outside the thesis scope (D17, D24) and has no backend. It
 * used to stream from a Supabase Edge Function that is no longer part of the
 * project, so Supabase was removed: the hook keeps its interface for the
 * flag-gated page, and sending a message reports that no tutor service is
 * connected instead of calling anything.
 */
export const TUTOR_UNAVAILABLE = "The AI tutor is not connected to a backend.";

export const useAITutor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("default");
  const [context, setContext] = useState<LearnerContext>({});

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setError(TUTOR_UNAVAILABLE);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateContext = useCallback((newContext: Partial<LearnerContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  return {
    messages,
    isLoading: false,
    error,
    mode,
    setMode,
    sendMessage,
    clearMessages,
    context,
    updateContext,
  };
};
