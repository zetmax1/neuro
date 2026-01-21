import { Brain, Route, Target, MessageSquare, BarChart3, Search } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Knowledge-Based Learning",
    description: "Our system maps your understanding to a structured knowledge base, identifying exactly what you know and what you need to learn.",
    gradient: "gradient-primary",
  },
  {
    icon: Route,
    title: "Personalized Pathways",
    description: "Algorithms analyze your progress to create optimal learning sequences, ensuring prerequisites are mastered before advancing.",
    gradient: "gradient-accent",
  },
  {
    icon: Target,
    title: "Adaptive Assessments",
    description: "Dynamic quizzes adjust difficulty in real-time, accurately measuring your knowledge while keeping you challenged.",
    gradient: "gradient-warm",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Tutoring",
    description: "Context-aware AI assistant provides hints and explanations tailored to your learning style and current struggles.",
    gradient: "gradient-primary",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visual dashboards show concept mastery, learning trends, and areas needing attention for transparent progress tracking.",
    gradient: "gradient-accent",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Knowledge-based retrieval finds related concepts, topics, and materials based on semantic similarity.",
    gradient: "gradient-warm",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Our intelligent system combines knowledge modeling with adaptive algorithms 
            to create a truly personalized learning experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border card-hover animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
