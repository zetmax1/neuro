import apiClient, { ensureCsrfToken } from "./client";
import type { Role } from "./types";

export interface Profile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_deleted: boolean;
  is_simulated: boolean;
  date_joined: string;
  role: Role;
  /**
   * Research consent (D42). Off until the learner turns it on, and nothing in
   * the platform is gated on it. `research_pseudonym` is deliberately not
   * here: it is the key an export row is filed under (D43).
   */
  research_consent: boolean;
  research_consent_at: string | null;
}

/** The consent flag on its own, as `/api/me/consent/` reports it. */
export interface ResearchConsent {
  research_consent: boolean;
  research_consent_at: string | null;
}

export interface LoginResponse {
  access: string;
}

/**
 * Auth calls (D16). The refresh token never appears here: it is set and read
 * as an httpOnly cookie by the browser.
 */
export const authApi = {
  /** Logs in; the access token is returned, the refresh token is a cookie. */
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    await ensureCsrfToken();
    const response = await apiClient.post<LoginResponse>("/api/accounts/token/", credentials);
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    /** D42: optional, and only ever true because the learner ticked the box. */
    research_consent?: boolean;
  }) => {
    const response = await apiClient.post("/api/accounts/register/", userData);
    return response.data;
  },

  /** A new access token from the cookie; used on start to restore a session. */
  refresh: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/api/accounts/token/refresh/", {});
    return response.data;
  },

  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get<Profile>("/api/accounts/profile/");
    return response.data;
  },

  /** Blacklists the refresh token server-side and clears the cookie. */
  logout: async (): Promise<void> => {
    await apiClient.post("/api/accounts/token/logout/", {});
  },
};

/**
 * Research consent (D42, addendum A4-13).
 *
 * Its own endpoint rather than a field of the profile update: consent is a
 * decision of the learner about their own data, and it must not be flippable
 * as a side effect of saving a name.
 */
export const consentApi = {
  get: async (): Promise<ResearchConsent> => {
    const response = await apiClient.get<ResearchConsent>("/api/me/consent/");
    return response.data;
  },

  /** `false` withdraws it, which keeps the learner out of *future* exports. */
  set: async (research_consent: boolean): Promise<ResearchConsent> => {
    const response = await apiClient.patch<ResearchConsent>("/api/me/consent/", {
      research_consent,
    });
    return response.data;
  },
};

export interface AdminUser extends Profile {
  deleted_at: string | null;
}

export const usersApi = {
  list: async (
    params: { role?: Role; simulated?: boolean; consent?: boolean } = {},
  ): Promise<AdminUser[]> => {
    const response = await apiClient.get("/api/accounts/users/", {
      params: {
        ...(params.role ? { role: params.role } : {}),
        ...(params.simulated === undefined ? {} : { simulated: String(params.simulated) }),
        ...(params.consent === undefined ? {} : { consent: String(params.consent) }),
      },
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data.results ?? []);
  },

  update: async (id: number, changes: { role?: Role; is_active?: boolean }): Promise<AdminUser> => {
    const response = await apiClient.patch(`/api/accounts/users/${id}/`, changes);
    return response.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/accounts/users/${id}/`);
  },
};
