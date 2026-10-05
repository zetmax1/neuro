/**
 * The one place numbers become text (audit 3.4).
 *
 * Two scales exist and must never be mixed:
 *
 * - **probabilities** — `p_mastery`, `accuracy`, `p̂`, P(G), P(S) — are in
 *   [0, 1] and are shown as percentages: 0.8 → "80%";
 * - **grades** — the test session score — are already percentages from the
 *   backend: 52.6 → "52.6%".
 *
 * The audit found both errors this split prevents: a probability printed as a
 * percentage ("0.8%") and a grade multiplied again ("100%" for a probability).
 * Every caller picks the function for the scale it holds.
 */

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * A probability in [0, 1] as a whole percentage: 0.8 → "80%".
 * Values outside [0, 1] are clamped; a missing value renders as "—".
 */
export function formatProbability(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(clamp01(value) * 100).toFixed(digits)}%`;
}

/**
 * A value that is already a percentage (a test grade, a pass mark): 52.6 → "52.6%".
 * One decimal is kept only when the value has one.
 */
export function formatGrade(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const bounded = Math.min(100, Math.max(0, value));
  return `${Number.isInteger(bounded) ? bounded : bounded.toFixed(1)}%`;
}

/** A raw probability for tables that show the model's own numbers: 0.6070 → "0.607". */
export function formatDecimal(value: number | null | undefined, digits = 3): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

/** θ or b, which are signed and unbounded: 0.79 → "+0.79", -1.2 → "−1.20". */
export function formatSigned(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const text = Math.abs(value).toFixed(digits);
  if (Number(text) === 0) return text;
  return value > 0 ? `+${text}` : `−${text}`;
}

/** "k / n", the D22 summary of a section or a course. */
export function formatRatio(done: number, total: number): string {
  return `${done} / ${total}`;
}

/** A transition "before → after" for two probabilities. */
export function formatProbabilityChange(before: number | null | undefined, after: number | null | undefined): string {
  return `${formatProbability(before)} → ${formatProbability(after)}`;
}
