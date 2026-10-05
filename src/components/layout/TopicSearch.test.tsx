import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TopicSearchResponse } from "@/api/learning.api";
import TopicSearch from "@/components/layout/TopicSearch";
import i18n from "@/lib/i18n";

/**
 * D40: the search panel shows what the backend returned and nothing else, and
 * a hit is handed to the learning path rather than to a page of its own.
 */

const { searchTopics } = vi.hoisted(() => ({ searchTopics: vi.fn() }));

vi.mock("@/api/learning.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/learning.api")>()),
  searchTopics,
}));

const answer = (overrides: Partial<TopicSearchResponse> = {}): TopicSearchResponse => ({
  q: "massiv",
  limit: 20,
  count: 1,
  results: [
    {
      topic_id: 7,
      name: "Massivlar",
      slug: "massivlar",
      kind: "topic",
      course_id: 1,
      course_name: "Ma'lumotlar tuzilmalari",
      status: "in_progress",
      p_mastery: 0.62,
    },
  ],
  ...overrides,
});

const Here = () => <span data-testid="landed">{useLocation().search}</span>;

const show = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <TopicSearch />
          <Routes>
            <Route path="/dashboard" element={<span />} />
            <Route path="/learning-path" element={<Here />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
};

/** Typing is debounced, so every assertion below goes through waitFor. */
const type = (text: string) =>
  fireEvent.change(screen.getByTestId("topic-search-input"), { target: { value: text } });

beforeEach(() => {
  searchTopics.mockReset();
  void i18n.changeLanguage("uz");
});

describe("TopicSearch (D40)", () => {
  it("shows the name, the course, the status and P(L) of a hit", async () => {
    searchTopics.mockResolvedValue(answer());
    show();
    type("massiv");

    await waitFor(() => expect(screen.getByText("Massivlar")).toBeInTheDocument());
    expect(searchTopics).toHaveBeenCalledWith("massiv");
    expect(screen.getByText(/Ma'lumotlar tuzilmalari/)).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-in_progress")).toBeInTheDocument();
    // P(L) is a probability, so it is shown as a percentage (audit 3.4).
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("gives a section no status and no P(L) (D22)", async () => {
    searchTopics.mockResolvedValue(
      answer({
        results: [
          {
            topic_id: 2,
            name: "Chiziqli tuzilmalar",
            slug: "linear",
            kind: "section",
            course_id: 1,
            course_name: "Ma'lumotlar tuzilmalari",
            status: null,
            p_mastery: null,
          },
        ],
      }),
    );
    show();
    type("chiziqli");

    await waitFor(() => expect(screen.getByText("Chiziqli tuzilmalar")).toBeInTheDocument());
    expect(screen.queryByTestId(/status-badge-/)).not.toBeInTheDocument();
    // Nothing is filled in for a value the node does not have.
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("selects the hit on the learning path", async () => {
    searchTopics.mockResolvedValue(answer());
    show();
    type("massiv");

    await waitFor(() => expect(screen.getByTestId("topic-search-hit-7")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("topic-search-hit-7"));

    await waitFor(() => expect(screen.getByTestId("landed")).toHaveTextContent("?topic=7"));
  });

  it("says so when nothing matches, instead of showing invented rows", async () => {
    searchTopics.mockResolvedValue(answer({ count: 0, results: [] }));
    show();
    type("zzz");

    await waitFor(() => expect(screen.getByText("Mos mavzu topilmadi")).toBeInTheDocument());
  });

  it("asks nothing until something is typed", async () => {
    searchTopics.mockResolvedValue(answer());
    show();
    fireEvent.focus(screen.getByTestId("topic-search-input"));

    // Long enough for the debounce timer to fire had there been a term.
    await act(() => new Promise((resolve) => setTimeout(resolve, 400)));
    expect(searchTopics).not.toHaveBeenCalled();
    expect(screen.queryByTestId("topic-search-results")).not.toBeInTheDocument();
  });

  it("reports a failed request rather than an empty list", async () => {
    searchTopics.mockRejectedValue(new Error("offline"));
    show();
    type("massiv");

    await waitFor(() => expect(screen.getByText("Ma’lumotni yuklab bo‘lmadi")).toBeInTheDocument());
  });
});
