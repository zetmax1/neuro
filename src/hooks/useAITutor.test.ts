import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TUTOR_UNAVAILABLE, useAITutor } from "./useAITutor";

describe("useAITutor without a backend (D24)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports that no tutor service is connected and calls nothing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useAITutor());

    await act(() => result.current.sendMessage("Rekursiya nima?"));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBe(TUTOR_UNAVAILABLE);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages).toEqual([{ role: "user", content: "Rekursiya nima?" }]);
  });

  it("ignores an empty message", async () => {
    const { result } = renderHook(() => useAITutor());
    await act(() => result.current.sendMessage("   "));
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
