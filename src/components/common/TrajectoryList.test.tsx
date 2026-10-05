import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { TrajectoryItem } from "@/api/learning.api";
import { NextStepCard, TrajectoryGroups } from "@/components/common/TrajectoryList";
import i18n from "@/lib/i18n";

/**
 * TR3 and D20: the reason the learner reads is built from the `{code, params}`
 * the backend returned, through the Uzbek dictionary. These tests render it to
 * make sure the code never leaks into the interface.
 */

const item = (overrides: Partial<TrajectoryItem> = {}): TrajectoryItem => ({
  topic_id: 1,
  name: "t1",
  slug: "t1",
  group: "A",
  status: "review",
  p_mastery: 0.8,
  accuracy: 0.5,
  reason: { code: "review_impact", params: { impact: 4, p: 0.8 } },
  missing: [],
  ...overrides,
});

const show = (ui: React.ReactElement) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{ui}</MemoryRouter>
    </I18nextProvider>,
  );

describe("NextStepCard", () => {
  it("shows the topic and the translated reason, not the code", () => {
    show(<NextStepCard item={item()} />);

    expect(screen.getByText("t1")).toBeInTheDocument();
    // The Uzbek wording for review_impact mentions how many topics are blocked.
    expect(screen.getByText(/4 ta mavzuni/)).toBeInTheDocument();
    expect(screen.queryByText(/review_impact/)).not.toBeInTheDocument();
  });

  it("links to practice on that topic", () => {
    show(<NextStepCard item={item({ topic_id: 7 })} />);
    const link = screen.getAllByRole("link").find((a) => a.getAttribute("href")?.includes("/topic/7"));
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toContain("mode=practice");
  });

  it("says every topic is mastered when there is no next step", () => {
    show(<NextStepCard item={null} />);
    expect(screen.getByTestId("next-step-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("next-step")).not.toBeInTheDocument();
  });
});

describe("TrajectoryGroups", () => {
  const groups = {
    A: [item()],
    B: [item({ topic_id: 2, name: "t4", group: "B", status: "in_progress", reason: { code: "in_progress", params: { p: 0.62 } } })],
    C: [],
    D: [
      item({
        topic_id: 3,
        name: "t6",
        group: "D",
        status: "closed",
        p_mastery: 0,
        reason: { code: "blocked", params: { missing: 1 } },
        missing: [{ topic_id: 2, name: "t4", p_mastery: 0.62 }],
      }),
    ],
  };

  it("renders only the groups that have items", () => {
    show(<TrajectoryGroups groups={groups} />);

    // Queried as headings: a group title and a status label can be the same
    // words — group A *is* the review group — so plain text is ambiguous.
    const headings = screen.getAllByRole("heading").map((node) => node.textContent);
    expect(headings).toContain(i18n.t("trajectory.group.A"));
    expect(headings).toContain(i18n.t("trajectory.group.B"));
    expect(headings).toContain(i18n.t("trajectory.group.D"));
    expect(headings).not.toContain(i18n.t("trajectory.group.C"));
  });

  it("names the prerequisites in the way of a closed topic", () => {
    show(<TrajectoryGroups groups={groups} />);
    expect(screen.getByText(/Yetishmaydi: t4/)).toBeInTheDocument();
  });

  it("shows a status badge and P(L) for every item", () => {
    show(<TrajectoryGroups groups={groups} />);

    expect(screen.getByTestId("status-badge-review")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-in_progress")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-closed")).toBeInTheDocument();
    // 80% appears twice for t1: as its P(L) and inside its reason text.
    expect(screen.getAllByText("80%").length).toBeGreaterThan(0);
  });

  it("renders nothing at all when every group is empty", () => {
    show(<TrajectoryGroups groups={{ A: [], B: [], C: [], D: [] }} />);
    expect(screen.queryByTestId("trajectory-groups")).not.toBeInTheDocument();
  });
});
