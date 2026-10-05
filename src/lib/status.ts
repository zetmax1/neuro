/**
 * The status palette — the single source for every place a status is drawn
 * (D21): graph nodes, cards, the heatmap grid and the legend.
 *
 * Colours follow figures 2.3 and 2.4 of the thesis:
 *
 * - mastered    — green
 * - in_progress — indigo, the current accent (`--primary`)
 * - open        — white background, neutral border
 * - closed      — grey dashed border and a lock
 * - review      — amber
 *
 * Text contrast is WCAG AA on every background: the audit found closed nodes
 * with text too pale to read, so closed text is slate-700, not a faded grey.
 * The hex values are for places Tailwind classes cannot reach (React Flow
 * edges, the minimap, SVG).
 */

import type { TopicStatus } from "@/api/types";
import { TOPIC_STATUSES } from "@/api/types";

export interface StatusStyle {
  /** Container classes: background, border (style and colour) and text. */
  container: string;
  /** A small filled marker for legends and lists. */
  dot: string;
  /** Badge classes for compact labels. */
  badge: string;
  /** Border colour as hex, for SVG/React Flow. */
  stroke: string;
  /** Fill colour as hex, for SVG/React Flow. */
  fill: string;
  /** Text colour as hex. */
  text: string;
  /** Whether the border is dashed (only `closed`). */
  dashed: boolean;
  /** Whether a lock icon is shown (only `closed`). */
  locked: boolean;
  /** i18n key of the label. */
  labelKey: `status.${TopicStatus}`;
}

export const STATUS_STYLES: Record<TopicStatus, StatusStyle> = {
  mastered: {
    container: "bg-emerald-50 border-2 border-emerald-600 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50",
    dot: "bg-emerald-600",
    badge: "bg-emerald-100 text-emerald-900 border border-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-50",
    stroke: "#059669",
    fill: "#ecfdf5",
    text: "#022c22",
    dashed: false,
    locked: false,
    labelKey: "status.mastered",
  },
  in_progress: {
    container: "bg-indigo-50 border-2 border-indigo-600 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-50",
    dot: "bg-indigo-600",
    badge: "bg-indigo-100 text-indigo-900 border border-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-50",
    stroke: "#4f46e5",
    fill: "#eef2ff",
    text: "#1e1b4b",
    dashed: false,
    locked: false,
    labelKey: "status.in_progress",
  },
  open: {
    container: "bg-white border-2 border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-50",
    dot: "bg-white border-2 border-slate-400",
    badge: "bg-white text-slate-900 border border-slate-400 dark:bg-slate-900 dark:text-slate-50",
    stroke: "#94a3b8",
    fill: "#ffffff",
    text: "#0f172a",
    dashed: false,
    locked: false,
    labelKey: "status.open",
  },
  closed: {
    container: "bg-slate-50 border-2 border-dashed border-slate-400 text-slate-700 dark:bg-slate-900/60 dark:border-slate-500 dark:text-slate-200",
    dot: "bg-slate-100 border-2 border-dashed border-slate-500",
    badge: "bg-slate-100 text-slate-800 border border-dashed border-slate-500 dark:bg-slate-800 dark:text-slate-100",
    stroke: "#64748b",
    fill: "#f8fafc",
    text: "#334155",
    dashed: true,
    locked: true,
    labelKey: "status.closed",
  },
  review: {
    container: "bg-amber-50 border-2 border-amber-500 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-950 border border-amber-500 dark:bg-amber-900/50 dark:text-amber-50",
    stroke: "#d97706",
    fill: "#fffbeb",
    text: "#451a03",
    dashed: false,
    locked: false,
    labelKey: "status.review",
  },
};

/** The order statuses are listed in a legend and in summaries. */
export const LEGEND_ORDER: readonly TopicStatus[] = [
  "mastered",
  "in_progress",
  "review",
  "open",
  "closed",
] as const;

export function statusStyle(status: TopicStatus | null | undefined): StatusStyle {
  return STATUS_STYLES[isTopicStatus(status) ? status : "closed"];
}

export function isTopicStatus(value: unknown): value is TopicStatus {
  return typeof value === "string" && (TOPIC_STATUSES as readonly string[]).includes(value);
}

/** Started topics stay answerable even when a new prerequisite arrives (TY5). */
export function isAnswerable(status: TopicStatus | null | undefined): boolean {
  return statusStyle(status) !== STATUS_STYLES.closed;
}

/** How many topics are in each status, every status present (zeros included). */
export function countByStatus(statuses: Iterable<TopicStatus>): Record<TopicStatus, number> {
  const counts = Object.fromEntries(TOPIC_STATUSES.map((s) => [s, 0])) as Record<TopicStatus, number>;
  for (const status of statuses) {
    if (isTopicStatus(status)) counts[status] += 1;
  }
  return counts;
}
