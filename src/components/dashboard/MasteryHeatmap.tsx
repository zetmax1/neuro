import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { HeatmapItem } from "@/api/analytics.api";
import { formatProbability } from "@/lib/format";
import { statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * A grid of topic statuses (addendum 2.1), in the one palette (D21).
 *
 * One cell per topic, each a link to that topic. The previous version held a
 * hard-coded `masteryData` array and a multi-colour legend of its own (D23).
 */
const MasteryHeatmap = ({ items }: { items: HeatmapItem[] }) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("common.empty")}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="mastery-heatmap">
      {items.map((item) => {
        const style = statusStyle(item.status);
        return (
          <Link
            key={item.topic_id}
            to={`/topic/${item.topic_id}`}
            title={`${item.topic_name} · ${t(style.labelKey)} · ${t("metric.p_mastery")} ${formatProbability(item.p_mastery)}`}
            data-testid={`heatmap-cell-${item.status}`}
            className={cn(
              "flex h-16 w-28 flex-col justify-between rounded-md p-2 text-xs transition-transform hover:scale-[1.03]",
              style.container,
            )}
          >
            <span className="line-clamp-2 font-medium leading-tight">{item.topic_name}</span>
            <span className="tabular-nums opacity-80">{formatProbability(item.p_mastery)}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MasteryHeatmap;
