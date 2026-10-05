import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  getTestSession,
  submitTestSession,
  type Question,
  type SubmitTestSessionResponse,
} from "@/api/assessment.api";
import MissingPrerequisites from "@/components/common/MissingPrerequisites";
import StatusBadge from "@/components/common/StatusBadge";
import ChoiceOption from "@/components/quiz/ChoiceOption";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdaptiveQuiz } from "@/hooks/useAdaptiveQuiz";
import { useInvalidateLearnerState, useModelConfig } from "@/hooks/useLearningData";
import { formatGrade, formatProbability, formatProbabilityChange } from "@/lib/format";
import { closedTopicMissing } from "@/lib/kbError";

/**
 * The quiz, in the two modes stage 7 separates (addendum 2.9).
 *
 * `?mode=practice` is adaptive practice: one question at a time, the verdict
 * and the instructor's explanation shown immediately, a toast when the status
 * changes, and no difficulty badge — the item was chosen by |b_q - θ_s|, so a
 * bucket label would misdescribe it.
 *
 * `?mode=test` keeps the existing exam design. Its result screen reports the
 * grade and the pass mark, and separately what the model did: P(L) before →
 * after and any topics the answers opened.
 *
 * Keyboard: A–D select, Enter confirms.
 */

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const QuizSession = () => {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "test" ? "test" : "practice";

  return mode === "test" ? <TestMode topicId={id} /> : <PracticeMode topicId={id} />;
};

// ---------------------------------------------------------------------------
// Adaptive practice
// ---------------------------------------------------------------------------

const PracticeMode = ({ topicId }: { topicId: string | undefined }) => {
  const { t } = useTranslation();
  const quiz = useAdaptiveQuiz(topicId);
  const [announced, setAnnounced] = useState<string | null>(null);

  // A status change is the thing a learner most needs to notice.
  useEffect(() => {
    if (!quiz.status || quiz.verdict === null) return;
    const key = `${quiz.attempts}:${quiz.status}`;
    if (announced === key) return;
    setAnnounced(key);
    if (quiz.openedTopics.length > 0) {
      toast.success(t("quiz.topics_opened"));
    }
  }, [quiz.status, quiz.verdict, quiz.attempts, quiz.openedTopics, announced, t]);

  useEffect(() => {
    if (quiz.isReviewRepeat) toast.info(t("quiz.review_repeat"));
  }, [quiz.isReviewRepeat, t]);

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (!quiz.question) return;
      const letter = event.key.toUpperCase();
      const index = LETTERS.indexOf(letter);
      if (index >= 0 && index < quiz.question.choices.length) {
        event.preventDefault();
        quiz.select(quiz.question.choices[index].id);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (quiz.verdict === null) void quiz.submit();
        else quiz.advance();
      }
    },
    [quiz],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (quiz.closedMissing) {
    return <ClosedTopic missing={quiz.closedMissing} />;
  }

  if (quiz.isLoading) {
    return (
      <Shell>
        <Skeleton className="h-64 w-full" />
      </Shell>
    );
  }

  if (quiz.error) {
    return (
      <Shell>
        <Notice icon={<AlertCircle className="h-5 w-5 text-destructive" />} text={t("common.error")}>
          <Button variant="outline" size="sm" onClick={() => void quiz.reload()}>
            {t("common.retry")}
          </Button>
        </Notice>
      </Shell>
    );
  }

  if (quiz.hasNoQuestions || (quiz.isComplete && quiz.attempts === 0)) {
    return (
      <Shell>
        <Notice text={t(quiz.hasNoQuestions ? "quiz.no_questions" : "quiz.no_more")}>
          <Button variant="outline" size="sm" asChild>
            <Link to="/assessment">{t("quiz.back_to_assessments")}</Link>
          </Button>
        </Notice>
      </Shell>
    );
  }

  if (quiz.isComplete || !quiz.question) {
    return (
      <Shell>
        <Card data-testid="practice-complete">
          <CardHeader>
            <CardTitle>{t("quiz.no_more")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quiz.status && (
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge status={quiz.status} />
                <span className="tabular-nums text-muted-foreground">
                  {t("metric.p_mastery")} {formatProbability(quiz.pMastery)}
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/assessment">{t("quiz.back_to_assessments")}</Link>
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const question = quiz.question;

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold" data-testid="practice-title">
            {t("quiz.practice_title", { topic: question.topic_name })}
          </h1>
          {quiz.status && (
            <div className="flex items-center gap-2 text-sm">
              <StatusBadge status={quiz.status} />
              <span className="tabular-nums text-muted-foreground">
                {t("metric.p_mastery")} {formatProbability(quiz.pMastery)}
              </span>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            {/* No difficulty badge: the item was chosen by |b_q - θ_s|. */}
            <CardTitle className="text-lg leading-snug">{question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.image && (
              <img src={question.image} alt="" className="max-h-64 rounded-md object-contain" />
            )}
            <div className="space-y-2">
              {question.choices.map((choice, index) => (
                <ChoiceOption
                  key={choice.id}
                  choice={choice}
                  index={index}
                  isSelected={quiz.selectedChoiceId === choice.id}
                  isSubmitting={quiz.isSubmitting}
                  feedback={quiz.verdict}
                  onSelect={quiz.select}
                />
              ))}
            </div>

            {quiz.verdict === null ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{t("quiz.keyboard_hint")}</p>
                <Button
                  onClick={() => void quiz.submit()}
                  disabled={quiz.selectedChoiceId === null || quiz.isSubmitting}
                  data-testid="quiz-check"
                >
                  {t("quiz.check")}
                </Button>
              </div>
            ) : (
              <Verdict quiz={quiz} />
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

const Verdict = ({ quiz }: { quiz: ReturnType<typeof useAdaptiveQuiz> }) => {
  const { t } = useTranslation();
  const correct = quiz.verdict === "correct";

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4" data-testid="quiz-verdict">
      <p className="flex items-center gap-2 font-medium">
        {correct ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5 text-rose-600" aria-hidden />
        )}
        {t(correct ? "quiz.correct" : "quiz.incorrect")}
      </p>

      {quiz.explanation && (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("quiz.explanation")}
          </p>
          <p className="text-sm">{quiz.explanation}</p>
        </div>
      )}

      {!quiz.isReviewRepeat && quiz.pBefore !== null && (
        <p className="text-sm tabular-nums text-muted-foreground">
          {t("quiz.p_change")}: {formatProbabilityChange(quiz.pBefore, quiz.pMastery)}
        </p>
      )}
      {quiz.isReviewRepeat && (
        <p className="text-sm text-muted-foreground">{t("quiz.review_repeat")}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={quiz.advance} data-testid="quiz-next">
          {t("quiz.next_question")}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Button>
        <Button variant="outline" asChild>
          <Link to="/assessment">{t("quiz.finish_practice")}</Link>
        </Button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

const TestMode = ({ topicId }: { topicId: string | undefined }) => {
  const { t } = useTranslation();
  const invalidate = useInvalidateLearnerState();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<SubmitTestSessionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [closed, setClosed] = useState<ReturnType<typeof closedTopicMissing> | null>(null);

  const session = useQuery({
    queryKey: ["assessments", "test-session", topicId],
    queryFn: () => getTestSession(topicId as string),
    enabled: Boolean(topicId),
    retry: false,
  });

  useEffect(() => {
    if (session.error) {
      const missing = closedTopicMissing(session.error);
      if (missing.length > 0) setClosed(missing);
    }
  }, [session.error]);

  const questions: Question[] = session.data?.questions ?? [];
  const current = questions[index];
  const unanswered = questions.length - Object.keys(answers).length;

  const submit = async () => {
    if (!topicId) return;
    setSubmitting(true);
    try {
      const payload = {
        topic_id: Number(topicId),
        answers: questions.map((question) => ({
          question_id: question.id,
          choice_id: answers[question.id] ?? null,
        })),
      };
      setResult(await submitTestSession(payload));
      invalidate();
    } catch (error) {
      const missing = closedTopicMissing(error);
      if (missing.length > 0) setClosed(missing);
      else toast.error(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (closed) return <ClosedTopic missing={closed} />;
  if (session.isLoading) {
    return (
      <Shell>
        <Skeleton className="h-64 w-full" />
      </Shell>
    );
  }
  if (session.isError) {
    return (
      <Shell>
        <Notice icon={<AlertCircle className="h-5 w-5 text-destructive" />} text={t("common.error")}>
          <Button variant="outline" size="sm" onClick={() => void session.refetch()}>
            {t("common.retry")}
          </Button>
        </Notice>
      </Shell>
    );
  }
  if (result) return <TestResult result={result} />;
  if (!current) {
    return (
      <Shell>
        <Notice text={t("quiz.no_questions")}>
          <Button variant="outline" size="sm" asChild>
            <Link to="/assessment">{t("quiz.back_to_assessments")}</Link>
          </Button>
        </Notice>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            {t("quiz.test_title", { topic: session.data?.topic_name ?? "" })}
          </h1>
          <div className="flex items-center gap-3">
            <Progress value={((index + 1) / questions.length) * 100} className="h-1.5" />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {t("quiz.of_n", { n: index + 1, total: questions.length })}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg leading-snug">{current.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {current.choices.map((choice, position) => (
                <ChoiceOption
                  key={choice.id}
                  choice={choice}
                  index={position}
                  isSelected={answers[current.id] === choice.id}
                  isSubmitting={submitting}
                  feedback={null}
                  onSelect={(choiceId) =>
                    setAnswers((previous) => ({ ...previous, [current.id]: choiceId }))
                  }
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                disabled={index === 0}
              >
                {t("common.back")}
              </Button>
              {index < questions.length - 1 ? (
                <Button size="sm" onClick={() => setIndex((value) => value + 1)}>
                  {t("common.next")}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  {unanswered > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {t("quiz.unanswered", { count: unanswered })}
                    </span>
                  )}
                  <Button size="sm" onClick={() => void submit()} disabled={submitting} data-testid="submit-test">
                    {t("quiz.submit_test")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

const TestResult = ({ result }: { result: SubmitTestSessionResponse }) => {
  const { t } = useTranslation();
  const config = useModelConfig();

  return (
    <Shell>
      <div className="space-y-4" data-testid="test-result">
        <h1 className="text-xl font-semibold">{t("quiz.result_title")}</h1>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("quiz.grade")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-3xl font-bold tabular-nums">{formatGrade(result.grade_percentage)}</p>
            <p className="text-muted-foreground">
              {t("quiz.points", { earned: result.earned_points, total: result.total_points })} ·{" "}
              {t("quiz.pass_mark")} {formatGrade(result.pass_mark_percentage)}
            </p>
            <p className={result.is_passed ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>
              {t(result.is_passed ? "quiz.passed" : "quiz.failed")}
            </p>
          </CardContent>
        </Card>

        {/* D7: the grade above is an exam score; the model state is separate. */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("quiz.model_after")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <StatusBadge status={result.status} />
              <span className="tabular-nums text-muted-foreground">
                {t("metric.p_mastery")} {formatProbability(result.p_mastery)}
              </span>
              {config.data && (
                <span className="text-xs text-muted-foreground">
                  (τ = {formatProbability(config.data.tau)})
                </span>
              )}
            </div>
            <p className="tabular-nums text-muted-foreground">
              {t("metric.accuracy")} {formatProbability(result.accuracy)}
            </p>
            {result.opened_topics.length > 0 && (
              <p className="text-emerald-700">
                {t("quiz.opened_topics")}: {result.opened_topics.length}
              </p>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" asChild>
          <Link to="/assessment">{t("quiz.back_to_assessments")}</Link>
        </Button>
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-3xl px-4 py-8">{children}</main>
  </div>
);

const Notice = ({
  icon,
  text,
  children,
}: {
  icon?: React.ReactNode;
  text: string;
  children?: React.ReactNode;
}) => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
      {icon}
      <p className="text-sm text-muted-foreground">{text}</p>
      {children}
    </CardContent>
  </Card>
);

const ClosedTopic = ({ missing }: { missing: { topic_id: number; name: string; p_mastery: number }[] }) => {
  const { t } = useTranslation();
  return (
    <Shell>
      <Card data-testid="closed-topic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" aria-hidden />
            {t("quiz.closed_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MissingPrerequisites missing={missing} />
          <Button variant="outline" size="sm" asChild>
            <Link to="/learning-path">{t("learning.title")}</Link>
          </Button>
        </CardContent>
      </Card>
    </Shell>
  );
};

export default QuizSession;
