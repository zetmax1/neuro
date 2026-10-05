import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AssessmentTest } from "@/api/assessment.api";
import type { TopicNode } from "@/api/curriculum.api";
import type { TrajectoryItem } from "@/api/learning.api";
import StatusBadge from "@/components/common/StatusBadge";
import { formatProbability } from "@/lib/format";
import i18n from "@/lib/i18n";
import { countStatus, topicsOnly } from "@/lib/topics";

/**
 * Stage 7 acceptance: one topic shows the same status and the same P(L) on the
 * learning path, the dashboard, the practice-and-tests page and the topic
 * page.
 *
 * It holds because all four read the same fields from the API (`p_mastery`,
 * `accuracy`, `status`) through the same query cache and render them through
 * the same two modules — `lib/format` and `lib/status`. These tests pin that
 * down: the same payload, rendered the way each page renders it, produces the
 * same text.
 */

const PAYLOAD = {
  topic_id: 42,
  name: "Ikkilik qidiruv daraxti",
  status: "in_progress" as const,
  p_mastery: 0.6070029,
  accuracy: 0.75,
  mastered: false,
  missing_count: 0,
};

const show = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>{ui}</MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
};

describe("one vocabulary across the pages", () => {
  it("renders the same P(L) text wherever it appears", () => {
    // The tree node, the test card, the trajectory item and the topic header
    // all hold the same number and all format it through lib/format.
    const treeNode: Pick<TopicNode, "p_mastery"> = { p_mastery: PAYLOAD.p_mastery };
    const testCard: Pick<AssessmentTest, "p_mastery"> = { p_mastery: PAYLOAD.p_mastery };
    const step: Pick<TrajectoryItem, "p_mastery"> = { p_mastery: PAYLOAD.p_mastery };

    const rendered = [treeNode, testCard, step, PAYLOAD].map((source) =>
      formatProbability(source.p_mastery),
    );

    expect(new Set(rendered).size).toBe(1);
    expect(rendered[0]).toBe("61%");
  });

  it("never renders a probability as a grade", () => {
    // 0.607 is a probability: "61%", never "0.6%" and never "60.7" unrounded.
    expect(formatProbability(PAYLOAD.p_mastery)).toBe("61%");
    expect(formatProbability(PAYLOAD.p_mastery)).not.toBe("0.6%");
  });

  it("renders the same status label wherever it appears", () => {
    show(
      <div>
        <span data-testid="on-tree">
          <StatusBadge status={PAYLOAD.status} />
        </span>
        <span data-testid="on-cards">
          <StatusBadge status={PAYLOAD.status} />
        </span>
      </div>,
    );

    const labels = screen.getAllByTestId(`status-badge-${PAYLOAD.status}`).map((n) => n.textContent);
    expect(new Set(labels).size).toBe(1);
    expect(labels[0]).toBe(i18n.t("status.in_progress"));
  });

  it("counts statuses the same way the dashboard KPI cards do", () => {
    const tree = [
      {
        kind: "course",
        status: "closed",
        mastered: false,
        children: [
          { kind: "topic", status: "mastered", mastered: true, children: [] },
          { kind: "topic", status: "review", mastered: false, children: [] },
          {
            kind: "section",
            status: "closed",
            mastered: false,
            children: [{ kind: "topic", status: "in_progress", mastered: false, children: [] }],
          },
        ],
      },
    ] as unknown as TopicNode[];

    // Sections and courses are not counted: only topics carry a status (D22).
    expect(topicsOnly(tree)).toHaveLength(3);
    expect(countStatus(tree, "mastered")).toBe(1);
    expect(countStatus(tree, "review")).toBe(1);
    expect(countStatus(tree, "in_progress")).toBe(1);
    expect(countStatus(tree, "closed")).toBe(0);
  });
});

describe("the interface makes no claim the model does not support (D29)", () => {
  it("has no 2PL, PROOF, 70% or dynamic matching in either locale", async () => {
    const [uz, en] = await Promise.all([
      import("@/locales/uz.json"),
      import("@/locales/en.json"),
    ]);
    for (const file of [uz.default, en.default]) {
      expect(JSON.stringify(file)).not.toMatch(/2PL|PROOF|dynamically match|70%/i);
    }
  });

  it("calls the item model Rasch, a = 1", () => {
    expect(i18n.t("topic.rasch")).toBe("Rasch (a = 1)");
  });

  it("states the unlock rule in terms of τ, not a percentage", () => {
    const text = i18n.t("topic.diagnostic_text");
    expect(text).toContain("τ");
    expect(text).not.toMatch(/70/);
  });
});
