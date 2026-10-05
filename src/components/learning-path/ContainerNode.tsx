import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useTranslation } from "react-i18next";

import type { NodeKind } from "@/api/types";
import { formatRatio } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A course or a section as a frame around its topics — the two-layer view of
 * figures 2.2 and 2.3 (addendum 2.2).
 *
 * A container never carries a status (D22): it shows "k / n mastered". A
 * prerequisite an instructor put on a section is drawn as one thick edge into
 * this frame, which is why the handles are on the frame itself.
 */

export interface ContainerNodeData extends Record<string, unknown> {
  label: string;
  kind: NodeKind;
  mastered: number;
  total: number;
  collapsed?: boolean;
  dimmed?: boolean;
}

const ContainerNode = ({ data, selected }: NodeProps) => {
  const { t } = useTranslation();
  const node = data as ContainerNodeData;
  const percent = node.total > 0 ? (node.mastered / node.total) * 100 : 0;

  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border-2 bg-muted/20 p-2",
        node.kind === "course" ? "border-slate-400" : "border-slate-300 border-dashed",
        selected && "ring-2 ring-primary ring-offset-2",
        node.dimmed && "opacity-25",
      )}
      data-testid={`graph-container-${node.kind}`}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-none !bg-slate-500 opacity-0" />

      <div className="flex items-baseline justify-between gap-2 px-1.5">
        <span className="truncate text-[13px] font-bold">{node.label}</span>
        <span className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
          {t(`kind.${node.kind}`)}
        </span>
      </div>

      <div className="space-y-1 px-1.5 pt-0.5">
        <div className="flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
          <span>{t("metric.mastered_of", { done: node.mastered, total: node.total })}</span>
          <span className="tabular-nums">{formatRatio(node.mastered, node.total)}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-none !bg-slate-500 opacity-0" />
    </div>
  );
};

export default ContainerNode;
