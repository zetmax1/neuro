import { ArrowRight, Brain, GitBranch, Route } from "lucide-react";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Header from "@/components/layout/Header";
import StatusLegend from "@/components/common/StatusLegend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

/**
 * The landing page.
 *
 * Its copy now describes what the system does — a knowledge graph, a student
 * model, and a next step with a reason — instead of the template's claims.
 * "Dynamic quizzes adjust difficulty in real-time" went with the others
 * (D29), and so did the links to /features, /pricing, /about and /privacy,
 * which were pages that do not exist (D23).
 *
 * three.js is ~850 kB and the background it draws is decoration, so it loads
 * after the text (stage 7 bundle work).
 */
const Hero3DBackground = lazy(() =>
  import("@/components/landing/Hero3DBackground").then((module) => ({
    default: module.Hero3DBackground,
  })),
);

const FEATURES = [
  { icon: GitBranch, titleKey: "landing.feature_graph", textKey: "landing.feature_graph_text" },
  { icon: Brain, titleKey: "landing.feature_model", textKey: "landing.feature_model_text" },
  { icon: Route, titleKey: "landing.feature_path", textKey: "landing.feature_path_text" },
] as const;

const Landing = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden pb-24 pt-20">
        <Suspense fallback={null}>
          <Hero3DBackground />
        </Suspense>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {t("landing.hero_title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("landing.hero_text")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                  {t(isAuthenticated ? "nav.dashboard" : "landing.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              {isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                  <Link to="/learning-path">{t("learning.title")}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-16">
        <div className="container mx-auto space-y-8 px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, titleKey, textKey }) => (
              <Card key={titleKey}>
                <CardContent className="space-y-3 py-6">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                  <h2 className="text-lg font-semibold">{t(titleKey)}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(textKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* The same five statuses the learner will meet on every page. */}
          <StatusLegend className="justify-center" />
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <Brain className="h-5 w-5 text-primary" aria-hidden />
            {t("app.name")}
          </span>
          <span>{t("app.tagline")}</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
