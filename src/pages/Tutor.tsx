import Header from "@/components/layout/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, RotateCcw } from "lucide-react";
import { useAITutor } from "@/hooks/useAITutor";
import { TutorModeSelector } from "@/components/tutor/TutorModeSelector";
import { ChatMessage } from "@/components/tutor/ChatMessage";
import { ChatInput } from "@/components/tutor/ChatInput";
import { LearnerContextBanner } from "@/components/tutor/LearnerContextBanner";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const Tutor = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    mode, 
    setMode, 
    sendMessage, 
    clearMessages,
    context,
    updateContext 
  } = useAITutor();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Set initial context
  useEffect(() => {
    updateContext({
      currentTopic: "Trees & Binary Trees",
      learnerLevel: "intermediate",
      weaknesses: ["Tree Traversal", "Recursion"],
      strengths: ["Arrays", "Linked Lists"],
    });
  }, [updateContext]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const welcomeMessage = {
    socratic: "I'm your Socratic tutor! I won't give you direct answers - instead, I'll guide you to discover solutions through thoughtful questions. Ready to think deeply? 🤔",
    visual: "I'm your Visual Explainer! I'll create diagrams, flowcharts, and visual representations to help you understand concepts. Let's make learning visual! 📊",
    "mistake-analysis": "I'm your Learning Analyst! I track your mistake patterns and provide targeted help. Don't worry about errors - they're learning opportunities! 🔍",
    "study-buddy": "Hey study buddy! 🎉 I'm here to make learning fun! We'll quiz each other, tackle challenges together, and celebrate your wins. Let's go! 🚀",
    default: "Hello! I'm your intelligent learning assistant. I can help you understand concepts, provide hints, and suggest what to review. What would you like to learn?",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-1">AI Tutor</h1>
          <p className="text-muted-foreground text-sm">
            Unique learning modes tailored to your style
          </p>
        </div>

        {/* Learning Context Banner */}
        <LearnerContextBanner
          currentTopic={context.currentTopic || "General"}
          learnerLevel={context.learnerLevel || "intermediate"}
          weaknesses={context.weaknesses}
        />

        {/* Chat Area */}
        <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden flex flex-col animate-slide-up delay-200">
          {/* Mode Selector */}
          <TutorModeSelector mode={mode} onModeChange={setMode} />

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* Welcome message based on mode */}
              {messages.length === 0 && (
                <ChatMessage 
                  role="assistant" 
                  content={welcomeMessage[mode]} 
                />
              )}
              
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
              
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <ChatMessage 
                  role="assistant" 
                  content="Thinking..." 
                />
              )}
            </div>
          </ScrollArea>

          {/* Suggestions & Input */}
          <div className="p-4 border-t border-border">
            {/* Quick Suggestions based on mode */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mode === "socratic" && (
                <>
                  <SuggestionButton onClick={handleSuggestionClick} text="Help me understand binary trees" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Why does recursion work?" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Walk me through tree traversal" />
                </>
              )}
              {mode === "visual" && (
                <>
                  <SuggestionButton onClick={handleSuggestionClick} text="Show me how a BST insert works" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Draw a linked list diagram" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Visualize quicksort steps" />
                </>
              )}
              {mode === "mistake-analysis" && (
                <>
                  <SuggestionButton onClick={handleSuggestionClick} text="Analyze my common mistakes" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Why do I confuse DFS and BFS?" />
                  <SuggestionButton onClick={handleSuggestionClick} text="What concepts should I review?" />
                </>
              )}
              {mode === "study-buddy" && (
                <>
                  <SuggestionButton onClick={handleSuggestionClick} text="Quiz me on trees!" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Challenge me with a problem" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Give me a memory trick" />
                </>
              )}
              {mode === "default" && (
                <>
                  <SuggestionButton onClick={handleSuggestionClick} text="Explain binary tree traversal" />
                  <SuggestionButton onClick={handleSuggestionClick} text="Help me understand recursion" />
                  <SuggestionButton onClick={handleSuggestionClick} text="What should I review next?" />
                </>
              )}
            </div>

            <div className="flex gap-2">
              <ChatInput
                onSend={sendMessage}
                isLoading={isLoading}
                placeholder={`Ask your ${mode === "study-buddy" ? "study buddy" : "tutor"} anything...`}
              />
              {messages.length > 0 && (
                <Button variant="outline" size="icon" onClick={clearMessages} title="Clear chat">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SuggestionButton = ({ onClick, text }: { onClick: (text: string) => void; text: string }) => (
  <button
    onClick={() => onClick(text)}
    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
  >
    {text}
  </button>
);

export default Tutor;
