// import Header from "@/components/layout/Header";
// import HeroSection from "@/components/landing/HeroSection";
// import FeaturesSection from "@/components/landing/FeaturesSection";
// import KnowledgeFlowSection from "@/components/landing/KnowledgeFlowSection";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { ArrowRight, Brain } from "lucide-react";

// const Landing = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <main>
//         <HeroSection />
//         <FeaturesSection />
//         <KnowledgeFlowSection />
        
//         {/* CTA Section */}
//         <section className="py-24 bg-background">
//           <div className="container mx-auto px-4">
//             <div className="max-w-3xl mx-auto text-center">
//               <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
//                 <Brain className="w-10 h-10 text-white" />
//               </div>
//               <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
//                 Ready to transform your learning?
//               </h2>
//               <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
//                 Join thousands of learners using knowledge-based intelligence to master new skills faster.
//               </p>
//               <Link to="/auth">
//                 <Button variant="hero" size="xl" className="group">
//                   Get Started Now
//                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="py-8 border-t border-border">
//           <div className="container mx-auto px-4">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
//                   <Brain className="w-4 h-4 text-white" />
//                 </div>
//                 <span className="font-semibold text-foreground">NeuroLearn</span>
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 © 2024 NeuroLearn. Intelligent Learning for Everyone.
//               </p>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// };

// export default Landing;



import Header from "@/components/layout/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import KnowledgeFlowSection from "@/components/landing/KnowledgeFlowSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Brain } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <KnowledgeFlowSection />
        
        {/* CTA Section - Solid block to anchor the page */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                Ready to transform your learning?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl leading-relaxed">
                Join thousands of learners using structured knowledge to master new skills faster and retain them longer.
              </p>
              <Link to="/auth">
                <Button size="xl" variant="secondary" className="group text-primary font-semibold rounded-full px-8">
                  Start learning for free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="mt-6 text-sm text-primary-foreground/60">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Structured SaaS Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg tracking-tight text-foreground">NeuroLearn</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Making advanced learning accessible through structured knowledge and personalized pathways.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NeuroLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;