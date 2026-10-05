/**
 * A rejected knowledge-base change → a translatable message.
 *
 * Since stage 2 the backend answers 400 with a stable shape:
 * `{reason, detail, chain?, chain_names?, edge?}`. `reason` is the code the UI
 * keys on, `chain_names` are the topics of a cycle so the editor can both
 * name them and highlight the path in red. `detail` is English prose from the
 * server and is only a last resort.
 */

import type { TFunction } from "i18next";

export interface KbErrorBody {
  reason?: string;
  detail?: string;
  chain?: number[];
  chain_names?: string[];
  edge?: [number, number];
}

const REASONS = new Set([
  "cycle", "nested", "self", "duplicate", "weight", "archived", "kind",
  "parent_is_topic", "has_children", "has_questions", "move_into_subtree",
  "duplicate_slug", "not_found", "version_missing", "y4",
]);

export function kbErrorBody(error: unknown): KbErrorBody | null {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  if (!data || typeof data !== "object") return null;
  const body = data as KbErrorBody;
  return body.reason || body.detail ? body : null;
}

/** The topics of a rejected cycle, for highlighting the path. */
export function cycleTopics(error: unknown): number[] {
  return kbErrorBody(error)?.chain ?? [];
}

export function kbErrorMessage(error: unknown, t: TFunction): string {
  const body = kbErrorBody(error);
  if (!body) return t("kb_error.default");
  if (body.reason && REASONS.has(body.reason)) {
    return t(`kb_error.${body.reason}`, {
      chain: (body.chain_names ?? body.chain ?? []).join(" → "),
    });
  }
  return body.detail || t("kb_error.default");
}

/** The unmet prerequisites of a 403 from a closed topic (TY1–TY4). */
export function closedTopicMissing(error: unknown): { topic_id: number; name: string; p_mastery: number }[] {
  const response = (error as { response?: { status?: number; data?: unknown } } | null)?.response;
  if (response?.status !== 403) return [];
  const missing = (response.data as { missing?: unknown } | undefined)?.missing;
  return Array.isArray(missing) ? missing : [];
}
