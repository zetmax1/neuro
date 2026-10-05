/**
 * Structured reasons → translatable messages (TR3, D20).
 *
 * The backend never phrases a reason: it returns `{code, params}` (for
 * example `{"code": "review_impact", "params": {"impact": 4, "p": 0.8}}`).
 * This module maps a code to its key in the locale files and formats the
 * params, so the wording lives in exactly one dictionary per language.
 */

import type { Reason, ReasonCode, TrajectoryGroup } from "@/api/types";
import { formatProbability } from "@/lib/format";

const KNOWN_CODES: readonly ReasonCode[] = ["review_impact", "in_progress", "ready", "blocked"];

export interface ReasonMessage {
  /** i18n key, e.g. `reason.review_impact`. */
  key: string;
  /** Interpolation values; `count` drives plural forms. */
  values: Record<string, string | number>;
}

export function reasonMessage(reason: Reason | null | undefined): ReasonMessage {
  if (!reason || !(KNOWN_CODES as readonly string[]).includes(reason.code)) {
    return { key: "reason.unknown", values: {} };
  }
  const params = reason.params ?? {};
  switch (reason.code) {
    case "review_impact":
      return {
        key: "reason.review_impact",
        values: {
          count: Number(params.impact ?? 0),
          p: formatProbability(params.p),
        },
      };
    case "in_progress":
      return { key: "reason.in_progress", values: { p: formatProbability(params.p) } };
    case "ready":
      return { key: "reason.ready", values: {} };
    case "blocked":
      return { key: "reason.blocked", values: { count: Number(params.missing ?? 0) } };
  }
}

/** The order the groups are shown in, and their title keys. */
export const GROUP_ORDER: readonly TrajectoryGroup[] = ["A", "B", "C", "D"] as const;

export function groupTitleKey(group: TrajectoryGroup): string {
  return `trajectory.group.${group}`;
}
