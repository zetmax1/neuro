// import { Brain, Route, Target, MessageSquare, BarChart3, Search } from "lucide-react";

// const features = [
//   {
//     icon: Brain,
//     title: "Knowledge-based learning",
//     description: "Our system maps your understanding to a structured knowledge base, identifying exactly what you know and what you need to learn.",
//     gradient: "gradient-primary",
//   },
//   {
//     icon: Route,
//     title: "Personalized pathways",
//     description: "Algorithms analyze your progress to create optimal learning sequences, ensuring prerequisites are mastered before advancing.",
//     gradient: "gradient-accent",
//   },
//   {
//     icon: Target,
//     title: "Adaptive assessments",
//     description: "Dynamic quizzes adjust difficulty in real-time, accurately measuring your knowledge while keeping you challenged.",
//     gradient: "gradient-warm",
//   },
//   {
//     icon: MessageSquare,
//     title: "Intelligent tutoring",
//     description: "Context-aware AI assistant provides hints and explanations tailored to your learning style and current struggles.",
//     gradient: "gradient-primary",
//   },
//   {
//     icon: BarChart3,
//     title: "Progress analytics",
//     description: "Visual dashboards show concept mastery, learning trends, and areas needing attention for transparent progress tracking.",
//     gradient: "gradient-accent",
//   },
//   {
//     icon: Search,
//     title: "Smart search",
//     description: "Knowledge-based retrieval finds related concepts, topics, and materials based on semantic similarity.",
//     gradient: "gradient-warm",
//   },
// ];

// const FeaturesSection = () => {
//   return (
//     <section className="py-24 bg-background">
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center max-w-2xl mx-auto mb-16">
//           <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
//             How It Works
//           </h2>
//           <p className="text-lg text-muted-foreground">
//             Our intelligent system combines knowledge modeling with adaptive algorithms 
//             to create a truly personalized learning experience.
//           </p>
//         </div>

//         {/* Features Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {features.map((feature, index) => (
//             <div
//               key={feature.title}
//               className="group p-6 rounded-2xl bg-card border border-border card-hover animate-slide-up"
//               style={{ animationDelay: `${index * 100}ms` }}
//             >
//               <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
//                 <feature.icon className="w-6 h-6 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-foreground mb-2">
//                 {feature.title}
//               </h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 {feature.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeaturesSection;


import { Brain, Route, Target, MessageSquare, BarChart3, Search } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Knowledge-based learning",
    description: "Our system maps your understanding to a structured knowledge base, identifying exactly what you know and what you need to learn.",
    // Replaced gradients with semantic color definitions
    colorClass: "text-primary",
    bgClass: "bg-primary/10 border-primary/20",
  },
  {
    icon: Route,
    title: "Personalized pathways",
    description: "Algorithms analyze your progress to create optimal learning sequences, ensuring prerequisites are mastered before advancing.",
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Target,
    title: "Adaptive assessments",
    description: "Dynamic quizzes adjust difficulty in real-time, accurately measuring your knowledge while keeping you challenged.",
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: MessageSquare,
    title: "Intelligent tutoring",
    description: "Context-aware AI assistant provides hints and explanations tailored to your learning style and current struggles.",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "Progress analytics",
    description: "Visual dashboards show concept mastery, learning trends, and areas needing attention for transparent progress tracking.",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Search,
    title: "Smart search",
    description: "Knowledge-based retrieval finds related concepts, topics, and materials based on semantic similarity.",
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10 border-rose-500/20",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Asymmetrical Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Everything you need to <br className="hidden sm:block" />
              learn efficiently.
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our intelligent system combines knowledge modeling with adaptive algorithms 
              to create a truly personalized learning experience that scales with you.
            </p>
          </div>
        </div>

        {/* Features Grid - Grounded cards with subtle hover states */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 hover:bg-muted/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 transition-colors duration-300 ${feature.bgClass}`}>
                <feature.icon className={`w-6 h-6 ${feature.colorClass}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturesSection;