import { useTranslation } from "react-i18next";

import { LEGEND_ORDER, statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * The five statuses and the two edge kinds (addendum 2.2).
 *
 * One legend component for the graph, the tree and the heatmap, so they
 * cannot drift apart.
 */
export function StatusLegend({
  withEdges = false,
  className,
}: {
  withEdges?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-xs", className)}
      data-testid="status-legend"
    >
      <span className="font-medium text-muted-foreground">{t("legend.title")}:</span>
      {LEGEND_ORDER.map((status) => {
        const style = statusStyle(status);
        return (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={cn("h-3 w-3 rounded-sm", style.dot)} aria-hidden />
            <span>{t(style.labelKey)}</span>
          </span>
        );
      })}
      {withEdges && (
        <>
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="8" aria-hidden>
              <line x1="0" y1="4" x2="22" y2="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>{t("legend.edge_direct")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="8" aria-hidden>
              <line
                x1="0"
                y1="4"
                x2="22"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span>{t("legend.edge_inherited")}</span>
          </span>
        </>
      )}
    </div>
  );
}

export default StatusLegend;
