import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Target, Brain } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft delay-300" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 right-[15%] animate-float hidden lg:block">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="absolute bottom-1/3 left-[10%] animate-float delay-200 hidden lg:block">
        <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
          <Target className="w-7 h-7 text-white" />
        </div>
      </div>
      <div className="absolute top-1/3 left-[20%] animate-float delay-500 hidden lg:block">
        <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Personalized Learning</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
            Learn Smarter with{" "}
            <span className="text-gradient font-display">Knowledge-Based</span>{" "}
            Intelligence
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            An adaptive learning system that understands your unique knowledge state, 
            creates personalized pathways, and guides you to mastery through intelligent tutoring.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="group">
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/learning-path">
              <Button variant="heroOutline" size="xl">
                View Learning Path
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in delay-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Adaptive Assessments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">Personalized Paths</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm">Intelligent Tutoring</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
