import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  type?: "hint" | "explanation" | "review";
}

const Tutor = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your intelligent learning assistant. I can help you understand concepts, provide hints when you're stuck, and suggest what to review based on your progress. What would you like to learn about today?",
      suggestions: [
        "Explain binary tree traversal",
        "Help me understand recursion",
        "What should I review next?",
      ],
    },
  ]);

  const quickSuggestions = [
    { icon: Lightbulb, text: "Give me a hint", color: "text-warning" },
    { icon: BookOpen, text: "Explain this concept", color: "text-primary" },
    { icon: AlertCircle, text: "What am I missing?", color: "text-destructive" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I see you're working on this topic. Based on your current progress and learning history, let me help you understand this concept better.\n\nA binary tree traversal visits each node exactly once. There are three main approaches:\n\n• **Inorder** (Left, Root, Right) - Good for BSTs to get sorted output\n• **Preorder** (Root, Left, Right) - Useful for copying trees\n• **Postorder** (Left, Right, Root) - Great for deletion operations\n\nWould you like me to walk through an example with code?",
        type: "explanation",
        suggestions: [
          "Show me code examples",
          "Practice problem on this",
          "Move to the next topic",
        ],
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-1">AI Tutor</h1>
          <p className="text-muted-foreground text-sm">
            Context-aware assistance based on your learning journey
          </p>
        </div>

        {/* Learning Context Banner */}
        <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-slide-up delay-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Currently studying: Trees & Binary Trees</p>
              <p className="text-xs text-muted-foreground">I'll tailor my responses to help with this topic</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden flex flex-col animate-slide-up delay-200">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] space-y-3",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl",
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-md" 
                        : "bg-secondary text-foreground rounded-bl-md"
                    )}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content.split('\n').map((line, i) => (
                          <span key={i}>
                            {line.includes('**') ? (
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                              }} />
                            ) : line}
                            {i < message.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          <div className="p-4 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => setInput(suggestion.text)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                >
                  <suggestion.icon className={cn("w-4 h-4", suggestion.color)} />
                  <span className="text-foreground">{suggestion.text}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your learning..."
                className="flex-1"
              />
              <Button onClick={handleSend} variant="hero" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tutor;
