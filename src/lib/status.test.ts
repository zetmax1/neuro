import { describe, expect, it } from "vitest";

import { TOPIC_STATUSES } from "@/api/types";
import {
  countByStatus,
  isAnswerable,
  isTopicStatus,
  LEGEND_ORDER,
  STATUS_STYLES,
  statusStyle,
} from "./status";

/**
 * D21: one palette for graph nodes, cards, the heatmap and the legend. The
 * colours follow figures 2.3 and 2.4 of the thesis.
 */
describe("the status palette (D21)", () => {
  it("covers all five statuses and nothing else", () => {
    expect(Object.keys(STATUS_STYLES).sort()).toEqual([...TOPIC_STATUSES].sort());
  });

  it("maps each status to the colour the thesis specifies", () => {
    expect(STATUS_STYLES.mastered.container).toContain("emerald");
    expect(STATUS_STYLES.in_progress.container).toContain("indigo");
    expect(STATUS_STYLES.review.container).toContain("amber");
    expect(STATUS_STYLES.open.container).toContain("white");
    expect(STATUS_STYLES.closed.container).toContain("slate");
  });

  it("dashes the border of a closed topic and locks it, and nothing else", () => {
    for (const status of TOPIC_STATUSES) {
      expect(STATUS_STYLES[status].dashed).toBe(status === "closed");
      expect(STATUS_STYLES[status].locked).toBe(status === "closed");
    }
  });

  it("gives every status an svg stroke and fill for React Flow", () => {
    for (const status of TOPIC_STATUSES) {
      expect(STATUS_STYLES[status].stroke).toMatch(/^#[0-9a-f]{6}$/i);
      expect(STATUS_STYLES[status].fill).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("keeps closed text dark enough to read (the audit found it too pale)", () => {
    // #334155 is slate-700: AA against the #f8fafc background.
    expect(STATUS_STYLES.closed.text).toBe("#334155");
    expect(STATUS_STYLES.closed.container).toContain("text-slate-700");
  });

  it("points every status at its own label key", () => {
    for (const status of TOPIC_STATUSES) {
      expect(STATUS_STYLES[status].labelKey).toBe(`status.${status}`);
    }
  });
});

describe("statusStyle", () => {
  it("resolves a known status", () => {
    expect(statusStyle("mastered")).toBe(STATUS_STYLES.mastered);
  });

  it("falls back to closed for anything unknown", () => {
    expect(statusStyle(undefined)).toBe(STATUS_STYLES.closed);
    expect(statusStyle(null)).toBe(STATUS_STYLES.closed);
    expect(statusStyle("locked" as never)).toBe(STATUS_STYLES.closed);
  });
});

describe("isAnswerable", () => {
  it("is false only for a closed topic (TY1-TY4)", () => {
    expect(isAnswerable("closed")).toBe(false);
    for (const status of ["open", "in_progress", "mastered", "review"] as const) {
      expect(isAnswerable(status)).toBe(true);
    }
  });
});

describe("helpers", () => {
  it("validates a status string", () => {
    expect(isTopicStatus("review")).toBe(true);
    expect(isTopicStatus("locked")).toBe(false);
    expect(isTopicStatus(4)).toBe(false);
  });

  it("counts every status, zeros included", () => {
    expect(countByStatus(["mastered", "mastered", "closed"])).toEqual({
      closed: 1,
      open: 0,
      in_progress: 0,
      mastered: 2,
      review: 0,
    });
  });

  it("lists the legend with mastery first and closed last", () => {
    expect(LEGEND_ORDER[0]).toBe("mastered");
    expect(LEGEND_ORDER[LEGEND_ORDER.length - 1]).toBe("closed");
    expect([...LEGEND_ORDER].sort()).toEqual([...TOPIC_STATUSES].sort());
  });
});
