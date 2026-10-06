import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Profile from "@/pages/Profile";
import i18n from "@/lib/i18n";

/**
 * D42 and D46: the consent card states the six facts the learner needs,
 * including the two that are easy to leave out — withdrawing applies to
 * future exports and does not rewrite files already produced, and deleting
 * the account while consent is active keeps the answers without the name or
 * the email (D11).
 */

const { getConsent, setConsent, getMeSummary } = vi.hoisted(() => ({
  getConsent: vi.fn(),
  setConsent: vi.fn(),
  getMeSummary: vi.fn(),
}));

vi.mock("@/api/auth.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/auth.api")>()),
  consentApi: { get: getConsent, set: setConsent },
}));

vi.mock("@/api/learning.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/learning.api")>()),
  getMeSummary,
}));

vi.mock("@/components/layout/Header", () => ({ default: () => <header /> }));

const summary = {
  email: "learner@example.org",
  name: "Nilufar",
  role: "student" as const,
  courses: [],
  topics_mastered: 0,
  topics_in_review: 0,
  attempts: 4,
  correct: 3,
  accuracy: 0.75,
  weekly_activity: [],
  activity_days: 7,
};

const show = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  getMeSummary.mockReset().mockResolvedValue(summary);
  getConsent.mockReset();
  setConsent.mockReset();
  void i18n.changeLanguage("uz");
});

describe("the consent card (D42)", () => {
  it("says what is collected, why, that the name is left out and how to withdraw", async () => {
    getConsent.mockResolvedValue({ research_consent: false, research_consent_at: null });
    show();

    await waitFor(() => expect(screen.getByTestId("consent-card")).toBeInTheDocument());
    expect(screen.getByTestId("consent-state")).toHaveTextContent("Rozilik berilmagan");
    expect(screen.getByText(/javoblaringiz va ularning vaqti/)).toBeInTheDocument();
    expect(screen.getByText(/magistrlik dissertatsiyasi/)).toBeInTheDocument();
    expect(screen.getByText(/Ismingiz va email'ingiz chiqmaydi/)).toBeInTheDocument();
    expect(screen.getByText(/rozilik bermasangiz ham tizimdan to‘liq foydalanasiz/)).toBeInTheDocument();
    // The assurance the backend cannot keep is stated, not glossed over.
    expect(
      screen.getByText(/allaqachon olingan fayllar o‘zgarmaydi/),
    ).toBeInTheDocument();
    // D46: what deletion does to the answers, so "I delete my account and it
    // is all gone" is not left as a reasonable assumption.
    expect(
      screen.getByText(/javoblaringiz ism va emailsiz tadqiqot uchun saqlanib qoladi/),
    ).toBeInTheDocument();
    expect(screen.getByText(/avval rozilikni bekor qiling/)).toBeInTheDocument();
  });

  it("offers consent when there is none and withdrawal when there is", async () => {
    getConsent.mockResolvedValue({ research_consent: false, research_consent_at: null });
    setConsent.mockResolvedValue({
      research_consent: true,
      research_consent_at: "2026-10-05T10:00:00Z",
    });
    show();

    await waitFor(() => expect(screen.getByTestId("consent-toggle")).toBeInTheDocument());
    expect(screen.getByTestId("consent-toggle")).toHaveTextContent("Rozilik berish");

    fireEvent.click(screen.getByTestId("consent-toggle"));
    await waitFor(() => expect(setConsent).toHaveBeenCalledWith(true));
  });

  it("shows the date consent was given and withdraws with false", async () => {
    getConsent.mockResolvedValue({
      research_consent: true,
      research_consent_at: "2026-10-05T10:00:00Z",
    });
    setConsent.mockResolvedValue({
      research_consent: false,
      research_consent_at: "2026-10-06T10:00:00Z",
    });
    show();

    await waitFor(() => expect(screen.getByTestId("consent-state")).toHaveTextContent("Rozilik berilgan"));
    expect(screen.getByText(/2026/)).toBeInTheDocument();

    expect(screen.getByTestId("consent-toggle")).toHaveTextContent("Rozilikni bekor qilish");
    fireEvent.click(screen.getByTestId("consent-toggle"));
    await waitFor(() => expect(setConsent).toHaveBeenCalledWith(false));
  });

  it("never shows the pseudonym", async () => {
    getConsent.mockResolvedValue({ research_consent: true, research_consent_at: null });
    show();

    await waitFor(() => expect(screen.getByTestId("consent-card")).toBeInTheDocument());
    expect(screen.queryByText(/pseudonym/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/psevdonim/i)).not.toBeInTheDocument();
  });

  it("leaves the rest of the profile alone when consent cannot be read", async () => {
    getConsent.mockRejectedValue(new Error("offline"));
    show();

    await waitFor(() => expect(screen.getByText("Nilufar")).toBeInTheDocument());
    expect(screen.queryByTestId("consent-card")).not.toBeInTheDocument();
  });
});
