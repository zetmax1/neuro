/**
 * First human-readable message in a DRF error response.
 *
 * DRF returns either {"detail": "..."} or field errors such as
 * {"choices": ["..."]}; both are reduced to one string. HTML error pages and
 * missing bodies fall back to `fallback`.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } } | null)?.response?.data;
  return firstMessage(data) ?? fallback;
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    const text = value.trim();
    return text && !text.startsWith("<") && text.length <= 500 ? text : undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);
      if (message) return message;
    }
    return undefined;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const ordered = "detail" in record
      ? [record.detail, ...Object.values(record)]
      : Object.values(record);
    for (const item of ordered) {
      const message = firstMessage(item);
      if (message) return message;
    }
  }
  return undefined;
}
