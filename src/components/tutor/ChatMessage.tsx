import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] space-y-3",
        role === "user" ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "p-4 rounded-2xl",
          role === "user" 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-secondary text-foreground rounded-bl-md"
        )}>
          <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                pre: ({ children }) => (
                  <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto my-2 text-xs">
                    {children}
                  </pre>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <code className="text-xs">{children}</code>
                  ) : (
                    <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {role === "user" && (
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-accent" />
        </div>
      )}
    </div>
  );
};
