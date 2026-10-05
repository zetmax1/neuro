import { describe, expect, it } from "vitest";

import { GROUP_ORDER, groupTitleKey, reasonMessage } from "./reasons";

/**
 * TR3 and D20: the backend returns `{code, params}` and never a sentence; the
 * wording lives in the locale files. These tests check the mapping, including
 * that `count` is passed so i18next can pick a plural form.
 */
describe("reasonMessage", () => {
  it("maps review_impact with its impact and P(L)", () => {
    expect(reasonMessage({ code: "review_impact", params: { impact: 4, p: 0.8 } })).toEqual({
      key: "reason.review_impact",
      values: { count: 4, p: "80%" },
    });
  });

  it("maps in_progress with P(L)", () => {
    expect(reasonMessage({ code: "in_progress", params: { p: 0.62 } })).toEqual({
      key: "reason.in_progress",
      values: { p: "62%" },
    });
  });

  it("maps ready with no parameters", () => {
    expect(reasonMessage({ code: "ready", params: {} })).toEqual({
      key: "reason.ready",
      values: {},
    });
  });

  it("maps blocked with the number of missing prerequisites", () => {
    expect(reasonMessage({ code: "blocked", params: { missing: 2 } })).toEqual({
      key: "reason.blocked",
      values: { count: 2 },
    });
  });

  it("falls back for a code it does not know, rather than showing the code", () => {
    expect(reasonMessage({ code: "whatever" as never, params: {} }).key).toBe("reason.unknown");
    expect(reasonMessage(null).key).toBe("reason.unknown");
    expect(reasonMessage(undefined).key).toBe("reason.unknown");
  });

  it("tolerates missing params", () => {
    expect(reasonMessage({ code: "blocked", params: {} }).values).toEqual({ count: 0 });
    expect(reasonMessage({ code: "review_impact", params: {} }).values).toEqual({
      count: 0,
      p: "—",
    });
  });
});

describe("trajectory groups", () => {
  it("orders A, B, C, D", () => {
    expect(GROUP_ORDER).toEqual(["A", "B", "C", "D"]);
  });

  it("points each group at its own title key", () => {
    expect(groupTitleKey("A")).toBe("trajectory.group.A");
    expect(groupTitleKey("D")).toBe("trajectory.group.D");
  });
});
