import { AlertCircle, BookOpenCheck, DoorOpen, RefreshCw, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { TopicNode } from "@/api/curriculum.api";
import MasteryRatio from "@/components/common/MasteryRatio";
import StatusLegend from "@/components/common/StatusLegend";
import { NextStepCard, TrajectoryGroups } from "@/components/common/TrajectoryList";
import MasteryHeatmap from "@/components/dashboard/MasteryHeatmap";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview, useLearningPathTree, useTrajectory } from "@/hooks/useLearningData";
import { flattenTopics } from "@/lib/topics";
import { useAuthStore } from "@/store/authStore";
import type { TopicStatus } from "@/api/types";

/**
 * The dashboard (addendum 2.1).
 *
 * The four KPI cards are the ones the thesis can defend: mastered, needing
 * review, open, and answers in the last seven days. Streak and "weekly goal"
 * are gone — they have nothing to do with the model — and so is the average
 * of P(L) values, which is not a meaningful quantity.
 *
 * "What next" comes from the trajectory service (Algorithm 2.5), not from four
 * heuristics computed here. A course root is never recommended: the service
 * returns topics only.
 */

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const overview = useDashboardOverview();
  const trajectory = useTrajectory();
  const tree = useLearningPathTree();

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto space-y-8 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {name ? t("dashboard.greeting", { name }) : t("dashboard.greeting_anon")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("app.tagline")}</p>
        </header>

        <KpiRow />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("trajectory.title")}</h2>
          {trajectory.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : trajectory.isError ? (
            <LoadError onRetry={() => void trajectory.refetch()} />
          ) : (
            <>
              <NextStepCard item={trajectory.data?.next ?? null} />
              {trajectory.data && <TrajectoryGroups groups={trajectory.data.groups} />}
            </>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{t("dashboard.knowledge_map")}</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/learning-path">{t("learning.title")}</Link>
            </Button>
          </div>
          {tree.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : tree.isError ? (
            <LoadError onRetry={() => void tree.refetch()} />
          ) : (
            <CourseCards courses={tree.data ?? []} />
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">{t("dashboard.heatmap")}</h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.heatmap_hint")}</p>
          </div>
          {overview.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : overview.isError ? (
            <LoadError onRetry={() => void overview.refetch()} />
          ) : (
            <>
              <MasteryHeatmap items={overview.data?.heatmap_data ?? []} />
              <StatusLegend />
            </>
          )}
        </section>
      </main>
    </div>
  );
};

/** The four KPI cards of addendum 2.1 — every number from the API (D23). */
const KpiRow = () => {
  const { t } = useTranslation();
  const tree = useLearningPathTree();
  const summary = useDashboardOverview();

  const topics = flattenTopics(tree.data ?? []).filter((node) => node.kind === "topic");
  const count = (status: TopicStatus) => topics.filter((node) => node.status === status).length;

  const cards = [
    {
      key: "mastered",
      label: t("dashboard.kpi_mastered"),
      value: `${count("mastered")} / ${topics.length}`,
      icon: BookOpenCheck,
    },
    { key: "review", label: t("dashboard.kpi_review"), value: count("review"), icon: RefreshCw },
    { key: "open", label: t("dashboard.kpi_open"), value: count("open"), icon: DoorOpen },
    {
      key: "answers",
      label: t("dashboard.kpi_answers_7d"),
      value: summary.data?.current_streak !== undefined ? (summary.data?.total_submissions ?? 0) : 0,
      icon: Target,
    },
  ];

  if (tree.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Skeleton key={card.key} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="kpi-row">
      {cards.map(({ key, label, value, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 py-5">
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold tabular-nums">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/** One card per course: k / n mastered and the status distribution (D22). */
const CourseCards = ({ courses }: { courses: TopicNode[] }) => {
  const { t } = useTranslation();
  const roots = courses.filter((node) => node.kind === "course");

  if (roots.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("dashboard.no_courses")}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roots.map((course) => {
        const topics = flattenTopics([course]).filter((node) => node.kind === "topic");
        return (
          <Card key={course.id} data-testid="course-card">
            <CardHeader className="pb-2">
              <CardTitle className="truncate text-base">
                <Link to="/learning-path" className="underline-offset-2 hover:underline">
                  {course.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MasteryRatio
                mastered={topics.filter((node) => node.mastered).length}
                total={topics.length}
                statuses={topics.map((node) => node.status)}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const LoadError = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("common.error")}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
