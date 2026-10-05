import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TopicHistoryResponse } from "@/api/learning.api";
import MissingPrerequisites from "@/components/common/MissingPrerequisites";
import StatusBadge from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useModelConfig } from "@/hooks/useLearningData";
import {
  formatDecimal,
  formatProbability,
  formatProbabilityChange,
  formatSigned,
} from "@/lib/format";

/**
 * "How this was calculated" (addendum 2.5) — the panel the defence uses to
 * show the model running.
 *
 * It replaces the "BKT + IRT PROOF" card and its "2PL" label: the item model
 * is Rasch, a = 1 (D29). Every number is read from the ledger, so these are
 * the values the model actually used, not what today's parameters would
 * produce. The τ line comes from `GET /api/config/model/`, never a constant
 * in the UI.
 */
const DiagnosticsPanel = ({
  history,
  isLoading,
}: {
  history: TopicHistoryResponse | undefined;
  isLoading: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const config = useModelConfig();

  if (isLoading) return <Skeleton className="h-72 w-full" />;
  if (!history) return null;

  const chart = history.attempts
    .filter((attempt) => attempt.p_after !== null)
    .map((attempt) => ({
      attempt: attempt.attempt_no,
      p: attempt.p_after ?? 0,
      correct: attempt.is_correct,
    }));

  return (
    <Card data-testid="diagnostics-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("topic.how_calculated")}</CardTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
          <StatusBadge status={history.status} />
          <span className="tabular-nums text-muted-foreground">
            {t("metric.p_mastery")} {formatProbability(history.p_mastery)}
          </span>
          {config.data && (
            <span className="text-xs text-muted-foreground">
              τ = {formatProbability(config.data.tau)}
            </span>
          )}
          <Badge variant="outline" title={t("topic.theta_hint")}>
            {t("metric.theta")} {formatSigned(history.theta)}
          </Badge>
          <Badge variant="secondary">{t("topic.rasch")}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {history.missing.length > 0 && <MissingPrerequisites missing={history.missing} />}

        {chart.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("topic.no_attempts")}</p>
        ) : (
          <>
            <section className="space-y-2">
              <h3 className="text-sm font-medium">{t("topic.chart_title")}</h3>
              <div className="h-56" data-testid="mastery-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value: number) => formatProbability(value)}
                    />
                    <Tooltip
                      formatter={(value: number) => formatProbability(value)}
                      labelFormatter={(label) => t("quiz.question_n", { n: label })}
                    />
                    {config.data && (
                      <ReferenceLine
                        y={config.data.tau}
                        stroke="#059669"
                        strokeDasharray="5 4"
                        label={{
                          value: t("topic.tau_line"),
                          position: "insideTopRight",
                          fontSize: 11,
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="p"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      isAnimationActive={false}
                      // Filled for a correct answer, hollow for a wrong one.
                      dot={{ r: 4, strokeWidth: 2, stroke: "#4f46e5" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">{t("topic.attempts_table")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="attempts-table">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-1.5 pr-3">{t("topic.col_no")}</th>
                      <th className="py-1.5 pr-3">{t("topic.col_question")}</th>
                      <th className="py-1.5 pr-3">{t("topic.col_result")}</th>
                      <th className="py-1.5 pr-3 text-right">{t("topic.col_p_hat")}</th>
                      <th className="py-1.5 pr-3 text-right">{t("topic.col_guess")}</th>
                      <th className="py-1.5 pr-3 text-right">{t("topic.col_slip")}</th>
                      <th className="py-1.5 pr-3">{t("topic.col_p_change")}</th>
                      <th className="py-1.5">{t("topic.col_time")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.attempts.map((attempt) => (
                      <tr key={attempt.attempt_no}>
                        <td className="py-1.5 pr-3 tabular-nums">{attempt.attempt_no}</td>
                        <td className="max-w-[18rem] truncate py-1.5 pr-3" title={attempt.question}>
                          {attempt.question}
                        </td>
                        <td className="py-1.5 pr-3">
                          <span className={attempt.is_correct ? "text-emerald-700" : "text-rose-700"}>
                            {t(attempt.is_correct ? "quiz.correct" : "quiz.incorrect")}
                          </span>
                          {attempt.source === "review_repeat" && (
                            <span className="ml-1 text-muted-foreground">
                              ({t("topic.source_review_repeat")})
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">
                          {formatDecimal(attempt.p_hat)}
                        </td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">
                          {formatDecimal(attempt.guess)}
                        </td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">
                          {formatDecimal(attempt.slip)}
                        </td>
                        <td className="py-1.5 pr-3 tabular-nums">
                          {attempt.p_after === null
                            ? t("common.none")
                            : formatProbabilityChange(attempt.p_before, attempt.p_after)}
                        </td>
                        <td className="py-1.5 text-muted-foreground">
                          {new Date(attempt.answered_at).toLocaleString(i18n.resolvedLanguage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticsPanel;
