import { describe, expect, it } from "vitest";

import { closedTopicMissing, cycleTopics, kbErrorBody, kbErrorMessage } from "./kbError";

/**
 * Since stage 2 a rejected knowledge-base change answers 400 with
 * `{reason, detail, chain?, chain_names?}`. The editor keys on `reason` and
 * highlights `chain`; `detail` is English server prose and is a last resort.
 */
const rejection = (data: unknown) => ({ response: { status: 400, data } });

// A translator stub: returns the key and the interpolated values, so the test
// asserts the mapping rather than a particular wording.
const t = ((key: string, values?: Record<string, unknown>) =>
  values && Object.keys(values).length ? `${key}|${JSON.stringify(values)}` : key) as never;

describe("kbErrorMessage", () => {
  it("keys on the reason code", () => {
    expect(kbErrorMessage(rejection({ reason: "nested", detail: "..." }), t)).toContain("kb_error.nested");
    expect(kbErrorMessage(rejection({ reason: "duplicate", detail: "..." }), t)).toContain("kb_error.duplicate");
  });

  it("passes the named cycle chain so the message can list it (Y3)", () => {
    const message = kbErrorMessage(
      rejection({
        reason: "cycle",
        detail: "The prerequisite would close a cycle.",
        chain: [3, 6, 8],
        chain_names: ["t3", "t6", "t8"],
      }),
      t,
    );
    expect(message).toContain("kb_error.cycle");
    expect(message).toContain("t3 → t6 → t8");
  });

  it("falls back to the chain ids when names are absent", () => {
    expect(kbErrorMessage(rejection({ reason: "cycle", chain: [1, 2] }), t)).toContain("1 → 2");
  });

  it("uses the server detail for a reason it does not know", () => {
    expect(kbErrorMessage(rejection({ reason: "brand_new", detail: "Something specific." }), t)).toBe(
      "Something specific.",
    );
  });

  it("falls back to the default message for anything else", () => {
    expect(kbErrorMessage(new Error("Network Error"), t)).toBe("kb_error.default");
    expect(kbErrorMessage(null, t)).toBe("kb_error.default");
    expect(kbErrorMessage(rejection("<!doctype html>"), t)).toBe("kb_error.default");
  });
});

describe("cycleTopics", () => {
  it("returns the chain to highlight in red", () => {
    expect(cycleTopics(rejection({ reason: "cycle", chain: [3, 6, 8] }))).toEqual([3, 6, 8]);
  });

  it("is empty when the rejection is not a cycle", () => {
    expect(cycleTopics(rejection({ reason: "nested" }))).toEqual([]);
    expect(cycleTopics(null)).toEqual([]);
  });
});

describe("closedTopicMissing (the 403 of a closed topic)", () => {
  it("reads the unmet prerequisites", () => {
    const error = {
      response: {
        status: 403,
        data: { missing: [{ topic_id: 4, name: "t4", p_mastery: 0.62 }] },
      },
    };
    expect(closedTopicMissing(error)).toEqual([{ topic_id: 4, name: "t4", p_mastery: 0.62 }]);
  });

  it("ignores any other status, so a 400 is not mistaken for a lock", () => {
    expect(closedTopicMissing(rejection({ missing: [{ topic_id: 1 }] }))).toEqual([]);
    expect(closedTopicMissing({ response: { status: 403, data: {} } })).toEqual([]);
    expect(closedTopicMissing(null)).toEqual([]);
  });
});

describe("kbErrorBody", () => {
  it("returns the body when it carries a reason or a detail", () => {
    expect(kbErrorBody(rejection({ reason: "self" }))?.reason).toBe("self");
    expect(kbErrorBody(rejection({ detail: "x" }))?.detail).toBe("x");
  });

  it("returns null for an unrelated error", () => {
    expect(kbErrorBody(rejection({}))).toBeNull();
    expect(kbErrorBody(new Error("boom"))).toBeNull();
  });
});
