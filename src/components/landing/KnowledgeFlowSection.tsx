// import { Database, Cpu, User, ArrowRight } from "lucide-react";

// const KnowledgeFlowSection = () => {
//   return (
//     <section className="py-24 bg-secondary/30">
//       <div className="container mx-auto px-4">
//         <div className="text-center max-w-2xl mx-auto mb-16">
//           <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
//             From knowledge to personalization
//           </h2>
//           <p className="text-lg text-muted-foreground">
//             See how our system transforms structured knowledge into adaptive learning experiences.
//           </p>
//         </div>

//         {/* Flow Diagram */}
//         <div className="max-w-4xl mx-auto">
//           <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
//             {/* Step 1: Knowledge Base */}
//             <div className="flex-1 p-6 rounded-2xl bg-card border border-border text-center animate-slide-up">
//               <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
//                 <Database className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge base</h3>
//               <p className="text-sm text-muted-foreground">
//                 Structured concepts, relationships, and prerequisite mappings
//               </p>
//             </div>

//             {/* Arrow */}
//             <div className="hidden md:flex items-center">
//               <ArrowRight className="w-8 h-8 text-primary animate-pulse-soft" />
//             </div>
//             <div className="md:hidden">
//               <ArrowRight className="w-8 h-8 text-primary rotate-90 animate-pulse-soft" />
//             </div>

//             {/* Step 2: Algorithms */}
//             <div className="flex-1 p-6 rounded-2xl bg-card border border-border text-center animate-slide-up delay-100">
//               <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
//                 <Cpu className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-lg font-semibold text-foreground mb-2">Processing algorithms</h3>
//               <p className="text-sm text-muted-foreground">
//                 Adaptive sequencing, gap detection, and recommendation engines
//               </p>
//             </div>

//             {/* Arrow */}
//             <div className="hidden md:flex items-center">
//               <ArrowRight className="w-8 h-8 text-accent animate-pulse-soft" />
//             </div>
//             <div className="md:hidden">
//               <ArrowRight className="w-8 h-8 text-accent rotate-90 animate-pulse-soft" />
//             </div>

//             {/* Step 3: Personalized Learning */}
//             <div className="flex-1 p-6 rounded-2xl bg-card border border-border text-center animate-slide-up delay-200">
//               <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4 shadow-lg">
//                 <User className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-lg font-semibold text-foreground mb-2">Personalized learning</h3>
//               <p className="text-sm text-muted-foreground">
//                 Tailored paths, adaptive content, and intelligent feedback
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default KnowledgeFlowSection;


import { Database, Cpu, User } from "lucide-react";

const KnowledgeFlowSection = () => {
  return (
    <section className="py-24 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            How intelligence becomes personalization
          </h2>
          <p className="text-lg text-muted-foreground">
            We don't just recommend videos. We map the DNA of what you're trying to learn.
          </p>
        </div>

        {/* Staggered Human-centric Layout */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-border z-0" />

          {/* Step 1 */}
          <div className="relative z-10 p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">1. Knowledge Graph</h3>
            <p className="text-muted-foreground leading-relaxed">
              We break down complex subjects into discrete concepts and map their exact prerequisites.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow md:mt-8">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">2. Gap Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our engine assesses your current understanding to pinpoint exactly what's holding you back.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow md:mt-16">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">3. Custom Pathway</h3>
            <p className="text-muted-foreground leading-relaxed">
              You receive a dynamically adjusting curriculum that focuses only on what you need to learn next.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default KnowledgeFlowSection;

