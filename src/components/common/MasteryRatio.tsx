import { useTranslation } from "react-i18next";

import type { TopicStatus } from "@/api/types";
import { Progress } from "@/components/ui/progress";
import { formatRatio } from "@/lib/format";
import { LEGEND_ORDER, statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * What a section or a course shows instead of a status (D22): "k / n mastered"
 * with a progress bar, and optionally the distribution of its topics'
 * statuses as one thin strip.
 *
 * A course is never labelled "in progress" or "locked" — those belong to
 * topics, which are the only nodes the model tracks.
 */
export function MasteryRatio({
  mastered,
  total,
  statuses,
  className,
}: {
  mastered: number;
  total: number;
  statuses?: TopicStatus[];
  className?: string;
}) {
  const { t } = useTranslation();
  const percent = total > 0 ? (mastered / total) * 100 : 0;

  return (
    <div className={cn("space-y-1.5", className)} data-testid="mastery-ratio">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{t("metric.mastered_of", { done: mastered, total })}</span>
        <span className="font-medium tabular-nums">{formatRatio(mastered, total)}</span>
      </div>
      <Progress value={percent} className="h-1.5" />
      {statuses && statuses.length > 0 && (
        <div className="flex h-1.5 w-full overflow-hidden rounded-full" aria-hidden>
          {LEGEND_ORDER.map((status) => {
            const count = statuses.filter((s) => s === status).length;
            if (count === 0) return null;
            return (
              <span
                key={status}
                className={statusStyle(status).dot}
                style={{ width: `${(count / statuses.length) * 100}%` }}
                title={`${t(statusStyle(status).labelKey)}: ${count}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MasteryRatio;
