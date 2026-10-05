import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TopicResponse } from "@/api/instructor.api";
import CourseStructureEditor from "@/components/instructor/CourseStructureEditor";
import i18n from "@/lib/i18n";

/**
 * D39: editing an existing course is a tree and a node editor, not a wizard.
 *
 * What is checked: the tree is built from the flat list in sibling order, the
 * ordering buttons are disabled exactly at the edges of a sibling row, and the
 * kind select offers only the changes the KB service accepts — a section with
 * children cannot become a topic, a topic with questions cannot become a
 * section (Y4), and a course's kind never changes at all.
 */

const { getTopics, reorderTopic, updateTopic } = vi.hoisted(() => ({
  getTopics: vi.fn(),
  reorderTopic: vi.fn(),
  updateTopic: vi.fn(),
}));

vi.mock("@/api/instructor.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/instructor.api")>()),
  getTopics,
  reorderTopic,
  updateTopic,
}));

// The prerequisite editor mounts React Flow, which needs a real layout; the
// structure tab is what these tests are about.
vi.mock("@/components/instructor/PrerequisiteEditor", () => ({
  default: ({ courseId }: { courseId: number | null }) => (
    <div data-testid="prerequisite-editor-stub">{courseId}</div>
  ),
}));

const node = (overrides: Partial<TopicResponse> & { id: number; name: string }): TopicResponse => ({
  slug: `n${overrides.id}`,
  parent: null,
  kind: "topic",
  description: "",
  position: 0,
  pass_mark_percentage: 60,
  test_question_count: 10,
  question_count: 0,
  child_count: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

/** C ── B1 (t1, t2, t3), B2; t1 holds a question, B1 holds three children. */
const course: TopicResponse[] = [
  node({ id: 1, name: "C", kind: "course", parent: null, position: 0, child_count: 2 }),
  node({ id: 2, name: "B1", kind: "section", parent: 1, position: 0, child_count: 3 }),
  node({ id: 3, name: "B2", kind: "section", parent: 1, position: 1, child_count: 0 }),
  node({ id: 4, name: "t1", parent: 2, position: 0, question_count: 5 }),
  node({ id: 5, name: "t2", parent: 2, position: 1 }),
  node({ id: 6, name: "t3", parent: 2, position: 2 }),
];

const show = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <CourseStructureEditor />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
};

const outline = () => screen.getByTestId("course-structure-editor");

/** Click a node in the tree. A name also appears in the two dropdowns, so the
 *  click is scoped to its outline row. */
const pick = (id: number, name: string) =>
  fireEvent.click(within(screen.getByTestId(`outline-node-${id}`)).getByText(name));

beforeEach(() => {
  getTopics.mockReset().mockResolvedValue(course);
  reorderTopic.mockReset().mockResolvedValue({ id: 4, parent: 2, siblings: [] });
  updateTopic.mockReset();
  void i18n.changeLanguage("uz");
});

describe("CourseStructureEditor (D39)", () => {
  it("draws the course as a tree in sibling order", async () => {
    show();
    await waitFor(() => expect(screen.getByTestId("outline-node-1")).toBeInTheDocument());

    const names = Array.from(outline().querySelectorAll("[data-testid^='outline-node-']")).map(
      (row) => row.getAttribute("data-testid"),
    );
    expect(names).toEqual([
      "outline-node-1",
      "outline-node-2",
      "outline-node-4",
      "outline-node-5",
      "outline-node-6",
      "outline-node-3",
    ]);
  });

  it("disables the ordering buttons at the edges of a sibling row", async () => {
    show();
    await waitFor(() => expect(screen.getByTestId("move-up-4")).toBeInTheDocument());

    expect(screen.getByTestId("move-up-4")).toBeDisabled();
    expect(screen.getByTestId("move-down-4")).toBeEnabled();
    expect(screen.getByTestId("move-up-5")).toBeEnabled();
    expect(screen.getByTestId("move-down-5")).toBeEnabled();
    expect(screen.getByTestId("move-down-6")).toBeDisabled();
  });

  it("moves a node one slot with a single request", async () => {
    show();
    await waitFor(() => expect(screen.getByTestId("move-down-4")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("move-down-4"));
    await waitFor(() => expect(reorderTopic).toHaveBeenCalledWith(4, "down"));
    expect(reorderTopic).toHaveBeenCalledTimes(1);
  });

  it("edits one node without walking the wizard", async () => {
    updateTopic.mockResolvedValue(course[4]);
    show();
    await waitFor(() => expect(screen.getByTestId("outline-node-5")).toBeInTheDocument());

    pick(5, "t2");
    fireEvent.change(screen.getByLabelText("Nomi"), { target: { value: "Massivlar" } });
    fireEvent.click(screen.getByTestId("save-node"));

    await waitFor(() => expect(updateTopic).toHaveBeenCalledTimes(1));
    expect(updateTopic.mock.calls[0][0]).toBe(5);
    expect(updateTopic.mock.calls[0][1]).toMatchObject({ name: "Massivlar", kind: "topic" });
  });

  it("refuses the kind change the service would refuse, and says why", async () => {
    show();
    await waitFor(() => expect(screen.getByTestId("outline-node-4")).toBeInTheDocument());

    // A topic holding questions cannot become a section (Y4).
    pick(4, "t1");
    expect(screen.getByTestId("node-kind")).toBeDisabled();
    expect(screen.getByText(/Savollar faqat mavzularda/)).toBeInTheDocument();

    // A section holding children is not a leaf.
    pick(2, "B1");
    expect(screen.getByTestId("node-kind")).toBeDisabled();
    expect(screen.getByText(/mavzuga aylantirib bo‘lmaydi/)).toBeInTheDocument();

    // An empty section can become a topic.
    pick(3, "B2");
    expect(screen.getByTestId("node-kind")).toBeEnabled();
  });

  it("never offers a course another kind or another parent", async () => {
    show();
    await waitFor(() => expect(screen.getByTestId("outline-node-1")).toBeInTheDocument());

    pick(1, "C");
    expect(screen.getByTestId("node-kind")).toBeDisabled();
    expect(screen.queryByTestId("node-parent")).not.toBeInTheDocument();
    expect(screen.getByText(/kurs — har doim ildiz/)).toBeInTheDocument();
  });

  it("opens the prerequisite editor for the selected course as a tab", async () => {
    show();
    await waitFor(() => expect(screen.getByTestId("tab-prerequisites")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("tab-prerequisites"));
    expect(screen.getByTestId("prerequisite-editor-stub")).toHaveTextContent("1");
    expect(screen.queryByTestId("node-editor")).not.toBeInTheDocument();
  });

  it("says there is nothing to edit rather than showing an empty tree", async () => {
    getTopics.mockResolvedValue([]);
    show();
    await waitFor(() => expect(screen.getByText("Hali kurs yo‘q")).toBeInTheDocument());
  });
});
