import Header from "@/components/layout/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import KnowledgeFlowSection from "@/components/landing/KnowledgeFlowSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <KnowledgeFlowSection />
        
        {/* CTA Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to transform your learning?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join thousands of learners using knowledge-based intelligence to master new skills faster.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">NeuroLearn</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 NeuroLearn. Intelligent Learning for Everyone.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
