import { Code2 } from "lucide-react";
import { LessonContent } from "./sessionContent";

interface LessonCardProps {
  content: LessonContent;
}

export const LessonCard = ({ content }: LessonCardProps) => {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <p className="text-base text-foreground leading-relaxed">{content.summary}</p>

      {/* Key points */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          key points
        </p>
        <ul className="space-y-2.5">
          {content.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <span className="text-sm text-muted-foreground leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Code example */}
      {content.codeExample && (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/40">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              {content.codeExample.label}
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-foreground bg-muted/20 overflow-x-auto leading-relaxed">
            {content.codeExample.code}
          </pre>
        </div>
      )}
    </div>
  );
};
