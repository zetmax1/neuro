import { AlertCircle, Check, CheckCircle2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { Mistake, MistakeTopic } from "@/api/learning.api";
import Header from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkMistakeReviewed, useMistakes } from "@/hooks/useLearningData";

/**
 * Review mistakes (D25, addendum 2.10).
 *
 * The data comes from `GET /api/learning/mistakes/`. The previous version read
 * a `mistakeStorage` array out of localStorage, with topics that do not exist
 * on the backend ("Loops Basics"); that file is gone (D23).
 *
 * There is no "clear" button: the answer ledger is append-only, so a mistake
 * can be marked reviewed but never deleted. "Try again" opens practice on the
 * topic, which serves a different question where it can — answering the same
 * one within the review window is logged as `review_repeat` and changes no
 * P(L) (D25).
 */

const Mistakes = () => {
  const { t } = useTranslation();
  const mistakes = useMistakes();
  const [topicFilter, setTopicFilter] = useState<number | "all">("all");

  const topics = mistakes.data?.topics ?? [];
  const visible = topicFilter === "all" ? topics : topics.filter((group) => group.topic_id === topicFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("mistakes.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("mistakes.subtitle")}</p>
        </header>

        {mistakes.isLoading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : mistakes.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{t("common.error")}</p>
              <Button variant="outline" size="sm" onClick={() => void mistakes.refetch()}>
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        ) : topics.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {t("mistakes.empty")}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm tabular-nums text-muted-foreground">
                {t("mistakes.count", {
                  reviewed: mistakes.data?.reviewed ?? 0,
                  total: mistakes.data?.total ?? 0,
                })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={topicFilter === "all" ? "default" : "outline"}
                  onClick={() => setTopicFilter("all")}
                >
                  {t("common.all")}
                </Button>
                {topics.map((group) => (
                  <Button
                    key={group.topic_id}
                    size="sm"
                    variant={topicFilter === group.topic_id ? "default" : "outline"}
                    onClick={() => setTopicFilter(group.topic_id)}
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
            </div>

            {mistakes.data && (
              <p className="text-xs text-muted-foreground">
                {t("mistakes.retry_hint", { hours: Math.round(mistakes.data.review_window_hours) })}
              </p>
            )}

            <div className="space-y-6">
              {visible.map((group) => (
                <TopicGroup key={group.topic_id} group={group} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const TopicGroup = ({ group }: { group: MistakeTopic }) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-3" data-testid="mistake-topic">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          <Link to={`/topic/${group.topic_id}`} className="underline-offset-2 hover:underline">
            {group.name}
          </Link>
        </h2>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/topic/${group.topic_id}/assessment?mode=practice`}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {t("mistakes.retry")}
          </Link>
        </Button>
      </div>
      <div className="space-y-3">
        {group.mistakes.map((mistake) => (
          <MistakeCard key={mistake.attempt_id} mistake={mistake} />
        ))}
      </div>
    </section>
  );
};

const MistakeCard = ({ mistake }: { mistake: Mistake }) => {
  const { t, i18n } = useTranslation();
  const mark = useMarkMistakeReviewed();

  return (
    <Card data-testid="mistake-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">{mistake.question}</CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {mistake.corrected_later ? (
              <Badge variant="outline" className="gap-1 border-emerald-600 text-emerald-800">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                {t("mistakes.corrected_later")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                {t("mistakes.not_corrected")}
              </Badge>
            )}
            {mistake.source === "review_repeat" && (
              <Badge variant="secondary" className="text-xs">
                {t("topic.source_review_repeat")}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(mistake.answered_at).toLocaleString(i18n.resolvedLanguage)}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <dl className="space-y-1.5">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{t("mistakes.your_answer")}:</dt>
            <dd className="font-medium text-rose-700">{mistake.selected_choice.text}</dd>
          </div>
          {mistake.correct_choice && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{t("mistakes.correct_answer")}:</dt>
              <dd className="font-medium text-emerald-700">{mistake.correct_choice.text}</dd>
            </div>
          )}
        </dl>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("mistakes.explanation")}
          </p>
          <p className={mistake.explanation ? "" : "italic text-muted-foreground"}>
            {mistake.explanation || t("mistakes.no_explanation")}
          </p>
        </div>

        {mistake.reviewed ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" aria-hidden />
            {t("mistakes.reviewed")}
          </p>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => mark.mutate(mistake.attempt_id)}
            disabled={mark.isPending}
            data-testid="mark-reviewed"
          >
            {t("mistakes.mark_reviewed")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Mistakes;
