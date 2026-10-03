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
//               <span className="text-sm">Guided practice</span>
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
import { ArrowRight, CheckCircle2, Brain, Target, Sparkles } from "lucide-react";
import { Hero3DBackground } from "./Hero3DBackground";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-background">
      {/* 3D Background */}
      <Hero3DBackground />
      
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
            {/* Abstract UI Representation that uses realistic static data */}
            <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-2xl overflow-hidden min-h-[450px] w-full ml-auto flex flex-col">
              <div className="flex items-center px-4 py-3 border-b border-border bg-muted/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="mx-auto text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-md shadow-sm border border-border/50 backdrop-blur-sm">
                  Neuro Learning
                </div>
              </div>
              
              {/* Static Data Mockup */}
              <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Next Objective</h3>
                    <p className="text-sm text-muted-foreground">Based on your recent performance</p>
                  </div>
                  <div className="w-14 h-14 rounded-full border-[3px] border-primary/20 flex items-center justify-center relative bg-background/50">
                    <svg className="w-14 h-14 absolute -inset-[3px] -rotate-90 drop-shadow-sm">
                      <circle className="text-primary" strokeWidth="3" strokeDasharray="125 125" strokeDashoffset="31.25" strokeLinecap="round" stroke="currentColor" fill="transparent" r="20" cx="28" cy="28" />
                    </svg>
                    <span className="text-sm font-bold text-foreground">75%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-background padding-0 shadow-sm border border-border/60 flex items-stretch rounded-xl overflow-hidden transition-all hover:border-primary/50 cursor-pointer hover:shadow-md group">
                    <div className="w-1.5 bg-primary" />
                    <div className="p-4 flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Brain className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                          <h4 className="font-semibold text-sm text-foreground">Neural Networks Basics</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">Machine Learning</span>
                            <span className="text-xs text-muted-foreground font-medium">Est. 15 mins</span>
                          </div>
                      </div>
                      <div className="h-full flex items-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 padding-0 border border-border/40 border-dashed flex items-stretch rounded-xl overflow-hidden opacity-70">
                    <div className="w-1.5 bg-muted-foreground/30" />
                    <div className="p-4 flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                          <Target className="w-5 h-5" />
                      </div>
                      <div>
                          <h4 className="font-semibold text-sm text-foreground">Gradient Descent</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded">Prerequisite Locked</span>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4">
                  <Button className="w-full shadow-lg shadow-primary/20 font-semibold" size="default">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Personalized Session
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Decorative offset block */}
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 transform translate-x-3 translate-y-3" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;