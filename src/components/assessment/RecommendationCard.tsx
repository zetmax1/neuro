import { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

export interface Recommendation {
  action: "review" | "next";    // "Review: …" or "Next topic: …"
  topic: string;
  reason: string;               // shown in expandable "Why?"
  prerequisite?: string;        // "required before learning X"
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export const RecommendationCard = ({ recommendation, index }: RecommendationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isReview = recommendation.action === "review";

  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className="animate-slide-up rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isReview ? "bg-warning/15" : "bg-primary/10",
          )}
        >
          {isReview ? (
            <BookOpen className={cn("w-5 h-5 text-warning")} />
          ) : (
            <ArrowRight className="w-5 h-5 text-primary" />
          )}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
            {isReview ? "Review" : "Next topic"}
          </p>
          <p className="text-sm font-semibold text-foreground">{recommendation.topic}</p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary font-medium transition-colors shrink-0"
          aria-expanded={expanded}
        >
          <span>{expanded ? "Hide" : "Why this?"}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable "Why?" section */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 pb-4 pt-0 border-t border-primary/10">
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {recommendation.reason}
          </p>
          {recommendation.prerequisite && (
            <p className="text-xs text-primary/70 mt-2 flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3" />
              This topic is required before learning{" "}
              <span className="font-semibold">{recommendation.prerequisite}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
