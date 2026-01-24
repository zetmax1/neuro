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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

export const useAITutor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("default");
  const [context, setContext] = useState<LearnerContext>({});

  const streamChat = useCallback(async (
    messagesToSend: Message[],
    onDelta: (text: string) => void,
    onDone: () => void
  ) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: messagesToSend, mode, context }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP error ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone();
  }, [mode, context]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat(
        [...messages, userMsg],
        updateAssistant,
        () => setIsLoading(false)
      );
    } catch (e) {
      console.error("AI Tutor error:", e);
      setError(e instanceof Error ? e.message : "Failed to get response");
      setIsLoading(false);
    }
  }, [messages, isLoading, streamChat]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateContext = useCallback((newContext: Partial<LearnerContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  return {
    messages,
    isLoading,
    error,
    mode,
    setMode,
    sendMessage,
    clearMessages,
    context,
    updateContext,
  };
};
