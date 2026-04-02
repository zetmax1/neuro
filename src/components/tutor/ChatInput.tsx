import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, isLoading, placeholder = "Ask me anything..." }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="flex items-end gap-2 w-full flex-1 bg-background rounded-2xl border border-input shadow-sm focus-within:ring-2 focus-within:ring-ring p-1.5 pl-4 transition-all">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        className="flex-1 max-h-[200px] min-h-[24px] bg-transparent resize-none outline-none py-2 text-sm placeholder:text-muted-foreground my-0.5 overflow-y-auto w-full"
        disabled={isLoading}
        rows={1}
      />
      <Button 
        onClick={handleSend} 
        variant="hero" 
        size="icon" 
        disabled={isLoading || !input.trim()}
        className="h-9 w-9 shrink-0 rounded-xl"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4 ml-0.5" />
        )}
      </Button>
    </div>
  );
};
