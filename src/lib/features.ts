/**
 * Build-time feature flags (Vite env). Unset means off.
 *
 * VITE_ENABLE_TUTOR — the AI tutor is outside the thesis scope (D17, D24):
 * its code is kept, but the page and its menu entry exist only when the
 * flag is "true".
 */
export const TUTOR_ENABLED: boolean = import.meta.env.VITE_ENABLE_TUTOR === "true";
