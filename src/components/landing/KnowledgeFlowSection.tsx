import { Database, Cpu, User, ArrowRight } from "lucide-react";

const KnowledgeFlowSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From Knowledge to Personalization
          </h2>
          <p className="text-lg text-muted-foreground">
            See how our system transforms structured knowledge into adaptive learning experiences.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Step 1: Knowledge Base */}
            <div className="flex-1 p-6 rounded-2xl bg-card border border-border text-center animate-slide-up">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">
                Structured concepts, relationships, and prerequisite mappings
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center">
              <ArrowRight className="w-8 h-8 text-primary animate-pulse-soft" />
            </div>
            <div className="md:hidden">
              <ArrowRight className="w-8 h-8 text-primary rotate-90 animate-pulse-soft" />
            </div>

            {/* Step 2: Algorithms */}
            <div className="flex-1 p-6 rounded-2xl bg-card border border-border text-center animate-slide-up delay-100">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Processing Algorithms</h3>
              <p className="text-sm text-muted-foreground">
                Adaptive sequencing, gap detection, and recommendation engines
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center">
              <ArrowRight className="w-8 h-8 text-accent animate-pulse-soft" />
            </div>
            <div className="md:hidden">
              <ArrowRight className="w-8 h-8 text-accent rotate-90 animate-pulse-soft" />
            </div>

            {/* Step 3: Personalized Learning */}
            <div className="flex-1 p-6 rounded-2xl bg-card border border-border text-center animate-slide-up delay-200">
              <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Personalized Learning</h3>
              <p className="text-sm text-muted-foreground">
                Tailored paths, adaptive content, and intelligent feedback
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeFlowSection;
