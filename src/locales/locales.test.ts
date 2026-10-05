import { describe, expect, it } from "vitest";

import en from "./en.json";
import uz from "./uz.json";

const flatten = (value: unknown, prefix = ""): string[] => {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
};

describe("locale files (D20)", () => {
  const uzKeys = flatten(uz).sort();
  const enKeys = flatten(en).sort();

  it("have exactly the same keys", () => {
    expect(enKeys).toEqual(uzKeys);
  });

  it("have no empty strings", () => {
    const empties = (obj: unknown, prefix = ""): string[] => {
      if (typeof obj === "string") return obj.trim() ? [] : [prefix];
      if (obj && typeof obj === "object") {
        return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
          empties(v, prefix ? `${prefix}.${k}` : k),
        );
      }
      return [];
    };
    expect(empties(uz)).toEqual([]);
    expect(empties(en)).toEqual([]);
  });

  it("keeps sentence case inside every Uzbek sentence (D20)", () => {
    // No title case: within one sentence only the first word may be
    // capitalised. A new sentence after a full stop starts with a capital as
    // normal prose does. Proper nouns, acronyms and the model's own symbols
    // are exempt.
    const exempt = /NeuroLearn|AI|BKT|Rasch|Enter|Big O|P\(|θ|τ|δ|ω|κ|Y[1-4]|p̂|№|Slug|[A-D]–[A-D]/;
    const offenders: string[] = [];
    const walk = (obj: unknown, prefix = "") => {
      if (typeof obj === "string") {
        for (const sentence of obj.split(/(?<=[.!?:])\s+/)) {
          const words = sentence.split(/[\s·—]+/).slice(1);
          if (words.some((w) => /^[A-ZА-ЯЎҒҲҚ]/.test(w) && !exempt.test(w))) {
            offenders.push(`${prefix}: ${sentence}`);
          }
        }
        return;
      }
      if (obj && typeof obj === "object") {
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          walk(v, prefix ? `${prefix}.${k}` : k);
        }
      }
    };
    walk(uz);
    expect(offenders).toEqual([]);
  });

  it("does not claim 2PL, PROOF, 70% or dynamic matching (D29)", () => {
    const banned = /2PL|PROOF|dynamically match|70%/i;
    for (const file of [uz, en]) {
      expect(JSON.stringify(file)).not.toMatch(banned);
    }
  });
});
