import { describe, expect, it } from "vitest";

import {
  formatDecimal,
  formatGrade,
  formatProbability,
  formatProbabilityChange,
  formatRatio,
  formatSigned,
} from "./format";

/**
 * Audit 3.4 found both scale errors in the interface: a probability printed as
 * a percentage ("0.8%") and a grade treated as one ("100%"). These tests pin
 * the split down.
 */
describe("formatProbability (a probability in [0, 1])", () => {
  it("renders a probability as a percentage", () => {
    expect(formatProbability(0.8)).toBe("80%");
    expect(formatProbability(0.6070)).toBe("61%");
    expect(formatProbability(0)).toBe("0%");
    expect(formatProbability(1)).toBe("100%");
  });

  it("never prints a probability as its own number — the 0.8% bug", () => {
    expect(formatProbability(0.008)).not.toBe("0.8%");
    expect(formatProbability(0.008)).toBe("1%");
  });

  it("keeps decimals when asked", () => {
    expect(formatProbability(0.6070, 1)).toBe("60.7%");
    expect(formatProbability(0.9764, 2)).toBe("97.64%");
  });

  it("clamps out-of-range values instead of printing them", () => {
    expect(formatProbability(1.4)).toBe("100%");
    expect(formatProbability(-0.2)).toBe("0%");
  });

  it("renders a missing value as an em dash", () => {
    expect(formatProbability(null)).toBe("—");
    expect(formatProbability(undefined)).toBe("—");
    expect(formatProbability(Number.NaN)).toBe("—");
  });
});

describe("formatGrade (a value that is already a percentage)", () => {
  it("does not multiply a grade again", () => {
    expect(formatGrade(52.6)).toBe("52.6%");
    expect(formatGrade(100)).toBe("100%");
    expect(formatGrade(0)).toBe("0%");
  });

  it("drops a trailing zero decimal", () => {
    expect(formatGrade(84)).toBe("84%");
    expect(formatGrade(84.2)).toBe("84.2%");
  });

  it("renders a missing grade as an em dash", () => {
    expect(formatGrade(null)).toBe("—");
  });
});

describe("the model's own numbers", () => {
  it("shows raw probabilities to three decimals", () => {
    expect(formatDecimal(0.6070029)).toBe("0.607");
    expect(formatDecimal(0.1272)).toBe("0.127");
    expect(formatDecimal(null)).toBe("—");
  });

  it("signs θ and b, which are unbounded", () => {
    expect(formatSigned(0.7924)).toBe("+0.79");
    expect(formatSigned(-1.2076)).toBe("−1.21");
    expect(formatSigned(0)).toBe("0.00");
    expect(formatSigned(null)).toBe("—");
  });

  it("renders a before → after transition", () => {
    expect(formatProbabilityChange(0.62, 0.8921)).toBe("62% → 89%");
    expect(formatProbabilityChange(null, 0.3)).toBe("— → 30%");
  });
});

describe("formatRatio (what a section or a course shows, D22)", () => {
  it("renders k / n", () => {
    expect(formatRatio(3, 8)).toBe("3 / 8");
    expect(formatRatio(0, 0)).toBe("0 / 0");
  });
});
