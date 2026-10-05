import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, GraduationCap, Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getAssessmentTests, type AssessmentTest } from "@/api/assessment.api";
import type { TopicStatus } from "@/api/types";
import StatusBadge from "@/components/common/StatusBadge";
import StatusLegend from "@/components/common/StatusLegend";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatProbability } from "@/lib/format";
import { statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * Practice and tests (addendum 2.3).
 *
 * The two modes are separated and labelled for what they are: adaptive
 * practice is where the student model runs, and a test is a stratified exam
 * whose result is a separate grade (D7).
 *
 * A closed topic's card is inert — it shows the lock and what is missing, and
 * the backend answers 403 anyway (TY1-TY4). The constant "Medium" badge is
 * gone: difficulty, when shown, comes from the questions' mean b. The
 * Easy/Medium/Hard filter went with it; filtering is by status, which is what
 * a learner actually chooses on.
 */

const STATUS_FILTERS: readonly (TopicStatus | "all")[] = ["all", "open", "in_progress", "review", "mastered", "closed"];

const Assessment = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TopicStatus | "all">("all");

  const tests = useQuery({ queryKey: ["assessments", "tests"], queryFn: getAssessmentTests });

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (tests.data ?? []).filter((test) => {
      const matchesQuery =
        !query ||
        test.name.toLowerCase().includes(query) ||
        (test.description ?? "").toLowerCase().includes(query);
      const matchesStatus = status === "all" || test.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [tests.data, search, status]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("assessment.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("assessment.subtitle")}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <ModeCard
            title={t("assessment.practice_mode")}
            description={t("assessment.practice_desc")}
            icon={<ArrowRight className="h-5 w-5" aria-hidden />}
          />
          <ModeCard
            title={t("assessment.test_mode")}
            description={t("assessment.test_desc")}
            icon={<GraduationCap className="h-5 w-5" aria-hidden />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("common.search")}
              className="pl-9"
              aria-label={t("common.search")}
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("assessment.filter_status")}>
            {STATUS_FILTERS.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={status === option ? "default" : "outline"}
                onClick={() => setStatus(option)}
                data-testid={`filter-${option}`}
              >
                {option === "all" ? t("common.all") : t(`status.${option}`)}
              </Button>
            ))}
          </div>
        </div>

        {tests.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : tests.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{t("common.error")}</p>
              <Button variant="outline" size="sm" onClick={() => void tests.refetch()}>
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
            <StatusLegend />
          </>
        )}
      </main>
    </div>
  );
};

const ModeCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="flex gap-3 py-5">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const TestCard = ({ test }: { test: AssessmentTest }) => {
  const { t } = useTranslation();
  const style = statusStyle(test.status);
  const closed = style.locked;

  return (
    <Card
      className={cn("flex flex-col", closed && "opacity-75")}
      data-testid={`test-card-${test.status}`}
      aria-disabled={closed}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{test.name}</CardTitle>
          <StatusBadge status={test.status} />
        </div>
        {test.parent_name && <p className="text-xs text-muted-foreground">{test.parent_name}</p>}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-2 text-sm">
          <p className="line-clamp-2 text-muted-foreground">{test.description}</p>
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <dt>{t("metric.p_mastery")}</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {formatProbability(test.p_mastery)}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>{t("metric.accuracy")}</dt>
              <dd className="font-medium tabular-nums text-foreground">
                {formatProbability(test.accuracy)}
              </dd>
            </div>
            <div>{t("assessment.questions", { count: test.question_count })}</div>
            <div>{t("assessment.minutes", { count: test.estimated_minutes })}</div>
          </dl>
          {closed && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden />
              {t("reason.blocked", { count: test.missing_count })}
            </p>
          )}
        </div>

        {closed ? (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/topic/${test.id}`}>{t("learning.open_topic")}</Link>
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild disabled={test.question_count === 0}>
              <Link to={`/topic/${test.id}/assessment?mode=practice`}>
                {t("assessment.start_practice")}
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild disabled={test.question_count === 0}>
              <Link to={`/topic/${test.id}/assessment?mode=test`}>{t("assessment.start_test")}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Assessment;
