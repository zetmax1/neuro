// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { ArrowRight, Sparkles, Target, Brain } from "lucide-react";

// const HeroSection = () => {
//   return (
//     <section className="relative min-h-[90vh] flex items-center overflow-hidden">
//       {/* Warm organic background */}
//       <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
//       <div className="absolute top-20 right-1/4 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
//       <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/4 rounded-full blur-3xl" />
      
//       {/* Subtle decorative dots */}
//       <div className="absolute top-1/4 right-[15%] animate-float hidden lg:block">
//         <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-md opacity-90">
//           <Brain className="w-7 h-7 text-white" />
//         </div>
//       </div>
//       <div className="absolute bottom-1/3 left-[10%] animate-float delay-200 hidden lg:block">
//         <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center shadow-md opacity-90">
//           <Target className="w-6 h-6 text-white" />
//         </div>
//       </div>
//       <div className="absolute top-1/3 left-[22%] animate-float delay-500 hidden lg:block">
//         <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-md opacity-90">
//           <Sparkles className="w-5 h-5 text-white" />
//         </div>
//       </div>

//       <div className="container mx-auto px-4 relative z-10">
//         <div className="max-w-3xl mx-auto text-center">
//           {/* Badge */}
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-8 animate-fade-in border border-primary/10">
//             <Sparkles className="w-4 h-4" />
//             <span>AI-powered personalized learning</span>
//           </div>

//           {/* Main Heading */}
//           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up leading-[1.1]">
//             Learn smarter with{" "}
//             <span className="font-display text-primary">knowledge-based</span>{" "}
//             intelligence
//           </h1>

//           {/* Subheading */}
//           <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-slide-up delay-100 leading-relaxed">
//             An adaptive system that understands your unique knowledge state, 
//             creates personalized pathways, and guides you to mastery.
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
//             <Link to="/auth">
//               <Button variant="hero" size="xl" className="group">
//                 Start learning
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Button>
//             </Link>
//             <Link to="/learning-path">
//               <Button variant="heroOutline" size="xl">
//                 View learning path
//               </Button>
//             </Link>
//           </div>

//           {/* Trust Indicators */}
//           <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in delay-300">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-success" />
//               <span className="text-sm">Adaptive assessments</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-primary" />
//               <span className="text-sm">Personalized paths</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-accent" />
//               <span className="text-sm">Intelligent tutoring</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;

















import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-background">
      {/* Subtle grid pattern instead of floating glowing orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTA */}
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              Now in Public Beta
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-[1.15]">
              Master any topic with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">adaptive</span> intelligence.
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Stop guessing what to study next. Our system maps your knowledge, finds the gaps, and builds a custom pathway to mastery.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link to="/auth">
                <Button size="xl" className="group rounded-full px-8">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/learning-path">
                <Button variant="outline" size="xl" className="rounded-full px-8 bg-background">
                  Explore Pathways
                </Button>
              </Link>
            </div>

            {/* Grounded Trust Indicators */}
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Personalized curriculum</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Real-time feedback</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual/Mockup */}
          <div className="relative hidden lg:block">
            {/* Abstract UI Representation */}
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden aspect-square max-h-[500px] w-full ml-auto">
              <div className="flex items-center px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
              </div>
              {/* Fake Dashboard Elements */}
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse" />
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted/60 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-muted/40 rounded w-full" />
                  <div className="h-8 bg-muted/40 rounded w-5/6" />
                  <div className="h-8 bg-primary/10 border border-primary/20 rounded w-full" />
                  <div className="h-8 bg-muted/40 rounded w-4/6" />
                </div>
              </div>
            </div>
            
            {/* Decorative offset block */}
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 transform translate-x-4 translate-y-4" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;