import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCircle2, Lock, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TopicStatus } from "@/api/types";
import { formatProbability } from "@/lib/format";
import { statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * A topic in the graph, drawn from the one status palette (D21).
 *
 * The previous version compared `mastery_percentage >= 70` — a probability
 * against 70 — and had three states. There are five (3.4), the status comes
 * from the backend rather than being inferred from a number, and the
 * threshold is τ, which the UI does not hard-code.
 *
 * Text stays at least 12 px at any zoom (addendum 2.2) and the labels are
 * translated (D20).
 */

export interface TopicNodeData extends Record<string, unknown> {
  label: string;
  status: TopicStatus;
  p_mastery: number;
  missing_count: number;
  /** Highlighted as part of Need(g); everything else is dimmed. */
  onPath?: boolean;
  /** Dimmed because a goal path is being shown and this is not on it. */
  dimmed?: boolean;
}

export const TOPIC_NODE_WIDTH = 220;
export const TOPIC_NODE_HEIGHT = 92;

const ICONS: Partial<Record<TopicStatus, typeof Lock>> = {
  closed: Lock,
  mastered: CheckCircle2,
  review: RefreshCw,
};

const CustomTopicNode = ({ data, selected }: NodeProps) => {
  const { t } = useTranslation();
  const node = data as TopicNodeData;
  const style = statusStyle(node.status);
  const Icon = ICONS[node.status];

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl p-3 shadow-sm transition-all",
        style.container,
        style.dashed && "border-dashed",
        selected && "ring-2 ring-primary ring-offset-2",
        node.onPath && "ring-2 ring-primary",
        node.dimmed && "opacity-25",
      )}
      style={{ width: TOPIC_NODE_WIDTH, height: TOPIC_NODE_HEIGHT }}
      data-testid={`graph-node-${node.status}`}
      title={`${node.label} · ${t(style.labelKey)}`}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-none !bg-slate-400 opacity-0" />

      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">
          {Icon && <Icon className="h-3 w-3" aria-hidden />}
          {t(style.labelKey)}
        </span>
        {node.status !== "closed" ? (
          <span className="shrink-0 text-xs font-semibold tabular-nums">
            {formatProbability(node.p_mastery)}
          </span>
        ) : (
          node.missing_count > 0 && (
            <span className="shrink-0 text-xs font-semibold tabular-nums">{node.missing_count}</span>
          )
        )}
      </div>

      {/* 13px: readable at any zoom the canvas allows (addendum 2.2). */}
      <p className="line-clamp-2 text-[13px] font-semibold leading-tight">{node.label}</p>

      {node.status !== "closed" && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, node.p_mastery * 100))}%`,
              backgroundColor: style.stroke,
            }}
          />
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-none !bg-slate-400 opacity-0" />
    </div>
  );
};

export default CustomTopicNode;
