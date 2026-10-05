import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import MasteryRatio from "@/components/common/MasteryRatio";
import Header from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeSummary } from "@/hooks/useLearningData";
import { formatProbability, formatSigned } from "@/lib/format";

/**
 * The profile, on real data only (D27, addendum 2.8).
 *
 * The hard-coded `weeklyActivity`, `masteryData`, `achievements` and
 * `recentHistory` arrays are gone, and with them XP, achievements and "study
 * hours": none of them can be computed from what the system records (D23).
 * What is left is what `GET /api/me/summary/` can answer — k / n mastered per
 * course, θ per course, attempts, accuracy, topics needing review, and weekly
 * activity counted from the answer times.
 *
 * The learner's own name is shown; where there is none the page says so
 * rather than printing "Learner".
 */

const Profile = () => {
  const { t } = useTranslation();
  const summary = useMeSummary();

  if (summary.isLoading) {
    return (
      <Shell>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </Shell>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <Shell>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">{t("common.error")}</p>
            <Button variant="outline" size="sm" onClick={() => void summary.refetch()}>
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const data = summary.data;
  const maxAnswers = Math.max(1, ...data.weekly_activity.map((day) => day.answers));

  return (
    <Shell>
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="space-y-1">
            <p className="text-xl font-semibold">
              {data.name ?? <span className="italic text-muted-foreground">{t("profile.no_name")}</span>}
            </p>
            <p className="text-sm text-muted-foreground">{data.email}</p>
          </div>
          <Badge variant="secondary">{t(`profile.role_${data.role}`)}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label={t("profile.attempts")} value={data.attempts} />
        <Metric label={t("profile.accuracy")} value={formatProbability(data.accuracy)} />
        <Metric label={t("profile.in_review")} value={data.topics_in_review} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("profile.courses")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {data.courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("dashboard.no_courses")}</p>
          ) : (
            data.courses.map((course) => (
              <div key={course.course_id} className="space-y-1.5" data-testid="profile-course">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link to="/learning-path" className="font-medium underline-offset-2 hover:underline">
                    {course.name}
                  </Link>
                  <span className="text-xs tabular-nums text-muted-foreground" title={t("profile.theta_hint")}>
                    {t("metric.theta")} {formatSigned(course.theta)}
                  </span>
                </div>
                <MasteryRatio mastered={course.mastered} total={course.total} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("profile.weekly")}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("profile.weekly_hint", { days: data.activity_days })}
          </p>
        </CardHeader>
        <CardContent>
          {data.weekly_activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("profile.no_activity")}</p>
          ) : (
            <ul className="flex items-end gap-2" data-testid="weekly-activity">
              {data.weekly_activity.map((day) => (
                <li key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-muted-foreground">{day.answers}</span>
                  <span
                    className="w-full rounded-t bg-primary/80"
                    style={{ height: `${Math.max(4, (day.answers / maxAnswers) * 72)}px` }}
                    title={t("profile.answers", { count: day.answers })}
                  />
                  <span className="text-[10px] text-muted-foreground">{day.date.slice(5)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardContent className="py-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </CardContent>
  </Card>
);

const Shell = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>
        {children}
      </main>
    </div>
  );
};

export default Profile;
