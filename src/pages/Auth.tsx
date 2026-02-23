import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, BookOpen, Sparkles } from "lucide-react";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { login, signup } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      signup(email, password, name);
    } else {
      login(email, password);
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full border border-white/30" />
          <div className="absolute bottom-[25%] right-[10%] w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute top-[50%] left-[50%] w-32 h-32 rounded-full border border-white/15" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-display">
            NeuroLearn
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            An intelligent learning companion that adapts to the way you think, not the other way around.
          </p>
          <div className="flex flex-col gap-3 text-left">
            {[
              { icon: BookOpen, text: "Personalized learning paths" },
              { icon: Sparkles, text: "AI-powered tutoring in 4 modes" },
              { icon: ArrowRight, text: "Adaptive assessments that grow with you" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Neuro<span className="text-primary">Learn</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSignup
                ? "Start your personalized learning journey today."
                : "Pick up right where you left off."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">Display name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="How should we call you?"
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={4}
                className="h-11"
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full mt-2">
              {isSignup ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
