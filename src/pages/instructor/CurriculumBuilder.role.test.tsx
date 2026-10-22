import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@/lib/i18n";
import CurriculumBuilder from "@/pages/instructor/CurriculumBuilder";
import { useAuthStore, type User } from "@/store/authStore";

/**
 * D15: the builder opens for the role the API reports, as RoleRoute does.
 * Its own guard used to check `is_staff`, so an instructor who is only in the
 * Instructor group was sent back to the landing page.
 */

const { getTopics } = vi.hoisted(() => ({ getTopics: vi.fn() }));

vi.mock("@/api/instructor.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/instructor.api")>()),
  getTopics,
}));

// The header needs the auth context and the two editors a real layout; the
// guard is what these tests are about.
vi.mock("@/components/layout/Header", () => ({ default: () => null }));
vi.mock("@/components/instructor/PrerequisiteEditor", () => ({ default: () => null }));
vi.mock("@/components/instructor/CourseStructureEditor", () => ({ default: () => null }));

const signIn = (user: Partial<User>) =>
  useAuthStore.setState({
    accessToken: "token",
    isAuthenticated: true,
    isLoading: false,
    user: { email: "x@example.com", first_name: "", last_name: "", ...user },
  });

const renderBuilder = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={["/instructor/curriculum-builder"]}>
        <Routes>
          <Route path="/" element={<div>landing</div>} />
          <Route path="/instructor/curriculum-builder" element={<CurriculumBuilder />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );

describe("CurriculumBuilder guard (D15)", () => {
  afterEach(() => {
    useAuthStore.getState().clearSession();
    getTopics.mockReset();
  });

  it("opens for an instructor who is not staff", async () => {
    getTopics.mockResolvedValue([]);
    signIn({ role: "instructor", is_staff: false });
    renderBuilder();
    await waitFor(() => expect(getTopics).toHaveBeenCalled());
    expect(screen.queryByText("landing")).not.toBeInTheDocument();
  });

  it("opens for an admin", async () => {
    getTopics.mockResolvedValue([]);
    signIn({ role: "admin", is_staff: true });
    renderBuilder();
    await waitFor(() => expect(getTopics).toHaveBeenCalled());
    expect(screen.queryByText("landing")).not.toBeInTheDocument();
  });

  it("sends a student back to the landing page", () => {
    getTopics.mockResolvedValue([]);
    signIn({ role: "student", is_staff: false });
    renderBuilder();
    expect(screen.getByText("landing")).toBeInTheDocument();
  });
});
