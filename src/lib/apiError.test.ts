import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiError";

const httpError = (data: unknown) => ({ response: { data } });

describe("getApiErrorMessage", () => {
  it("prefers DRF detail", () => {
    expect(getApiErrorMessage(httpError({ detail: "Not found.", other: ["x"] }), "fallback")).toBe("Not found.");
  });

  it("reads the first field error (D11 choice removal)", () => {
    const body = { choices: ["Choices that learners have selected cannot be removed; edit their text instead."] };
    expect(getApiErrorMessage(httpError(body), "fallback")).toBe(body.choices[0]);
  });

  it("walks nested field errors", () => {
    expect(getApiErrorMessage(httpError({ choices: [{}, { text: ["This field is required."] }] }), "f")).toBe(
      "This field is required.",
    );
  });

  it("falls back for HTML pages, empty bodies and network errors", () => {
    expect(getApiErrorMessage(httpError("<!doctype html><h1>Server Error</h1>"), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(httpError(""), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(new Error("Network Error"), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
  });
});
