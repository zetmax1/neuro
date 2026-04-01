import { cn } from "@/lib/utils";

export type SessionPhase = "intro" | "lesson" | "quiz" | "results" | "next";

const steps: { phase: SessionPhase; label: string }[] = [
  { phase: "intro",   label: "intro" },
  { phase: "lesson",  label: "lesson" },
  { phase: "quiz",    label: "quiz" },
  { phase: "results", label: "results" },
  { phase: "next",    label: "next up" },
];

const order: SessionPhase[] = ["intro", "lesson", "quiz", "results", "next"];

interface SessionStepperProps {
  current: SessionPhase;
}

export const SessionStepper = ({ current }: SessionStepperProps) => {
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const pending = idx > currentIdx;

        return (
          <div key={step.phase} className="flex items-center">
            {/* Step dot */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  done    && "bg-success",
                  active  && "bg-primary scale-125",
                  pending && "bg-border",
                )}
              />
              <span
                className={cn(
                  "text-xs transition-colors duration-200 whitespace-nowrap",
                  active  && "text-foreground font-medium",
                  done    && "text-success",
                  pending && "text-muted-foreground/50",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line — not after last */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 mx-2 mb-4 transition-colors duration-300",
                  idx < currentIdx ? "bg-success/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
