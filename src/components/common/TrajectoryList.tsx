import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { TrajectoryItem } from "@/api/learning.api";
import type { TrajectoryGroup } from "@/api/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatProbability } from "@/lib/format";
import { GROUP_ORDER, groupTitleKey, reasonMessage } from "@/lib/reasons";
import { statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * The trajectory (Algorithm 2.5), as the dashboard and the learning path show
 * it: the first item as one large button, the rest grouped A–D.
 *
 * Every item carries its reason, translated from the `{code, params}` the
 * backend returns (TR3, D20) — the browser never invents an explanation.
 */

export function TrajectoryStep({ item }: { item: TrajectoryItem }) {
  const { t } = useTranslation();
  const reason = reasonMessage(item.reason);

  return (
    <li className="flex items-center justify-between gap-3 py-2" data-testid="trajectory-item">
      <div className="min-w-0 space-y-0.5">
        <Link
          to={`/topic/${item.topic_id}`}
          className="block truncate font-medium underline-offset-2 hover:underline"
        >
          {item.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{t(reason.key, reason.values)}</p>
        {item.missing.length > 0 && (
          <p className="truncate text-xs text-muted-foreground">
            {t("trajectory.missing", { names: item.missing.map((m) => m.name).join(", ") })}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="tabular-nums text-xs text-muted-foreground">
          {formatProbability(item.p_mastery)}
        </span>
        <StatusBadge status={item.status} />
      </div>
    </li>
  );
}

/** The head of the trajectory, as the primary call to action. */
export function NextStepCard({ item }: { item: TrajectoryItem | null }) {
  const { t } = useTranslation();

  if (!item) {
    return (
      <Card data-testid="next-step-empty">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          {t("trajectory.empty")}
        </CardContent>
      </Card>
    );
  }

  const reason = reasonMessage(item.reason);
  const style = statusStyle(item.status);

  return (
    <Card className={cn("border-2", style.container)} data-testid="next-step">
      <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">
            {t("trajectory.next")}
          </p>
          <h3 className="truncate text-xl font-semibold">{item.name}</h3>
          <p className="text-sm opacity-90">{t(reason.key, reason.values)}</p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link to={`/topic/${item.topic_id}/assessment?mode=practice`}>
            {t("learning.practice")}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function TrajectoryGroups({
  groups,
}: {
  groups: Record<TrajectoryGroup, TrajectoryItem[]>;
}) {
  const { t } = useTranslation();
  const present = GROUP_ORDER.filter((group) => (groups[group] ?? []).length > 0);

  if (present.length === 0) return null;

  return (
    <div className="space-y-6" data-testid="trajectory-groups">
      {present.map((group) => (
        <section key={group} className="space-y-1">
          <h4 className="text-sm font-semibold text-muted-foreground">{t(groupTitleKey(group))}</h4>
          <ul className="divide-y divide-border">
            {groups[group].map((item) => (
              <TrajectoryStep key={item.topic_id} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
