import { afterEach, describe, expect, it, vi } from "vitest";

const loadFlag = async () => {
  vi.resetModules();
  return (await import("./features")).TUTOR_ENABLED;
};

describe("TUTOR_ENABLED (D24)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is off unless VITE_ENABLE_TUTOR is exactly 'true'", async () => {
    vi.stubEnv("VITE_ENABLE_TUTOR", "");
    expect(await loadFlag()).toBe(false);
    vi.stubEnv("VITE_ENABLE_TUTOR", "false");
    expect(await loadFlag()).toBe(false);
    vi.stubEnv("VITE_ENABLE_TUTOR", "1");
    expect(await loadFlag()).toBe(false);
  });

  it("is on for 'true'", async () => {
    vi.stubEnv("VITE_ENABLE_TUTOR", "true");
    expect(await loadFlag()).toBe(true);
  });
});
