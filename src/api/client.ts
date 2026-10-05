import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { useAuthStore } from "../store/authStore";

/**
 * The one HTTP client (D16).
 *
 * The access token lives in memory only — in the Zustand store, never in
 * localStorage, where audit 7.3 found both tokens. The refresh token is an
 * httpOnly cookie the browser sends on its own; `withCredentials` is what
 * makes it travel, and the CSRF header is what makes that safe.
 *
 * On a 401 the client refreshes once and replays the original request. Several
 * requests failing at the same time share a single refresh, so a page with
 * four parallel queries does not fire four refreshes and rotate the cookie
 * four times.
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CSRF_COOKIE = "csrftoken";
const CSRF_HEADER = "X-CSRFToken";
const REFRESH_PATH = "/api/accounts/token/refresh/";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Required for the httpOnly refresh cookie to be sent and set.
  withCredentials: true,
});

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** The CSRF token, from the cookie if present, otherwise fetched once. */
export async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/accounts/csrf/`, { withCredentials: true });
    return response.data?.csrfToken ?? readCookie(CSRF_COOKIE);
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Unsafe methods carry the CSRF token: the refresh cookie travels with them.
  const method = (config.method ?? "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method) && config.headers) {
    const csrf = await ensureCsrfToken();
    if (csrf) config.headers[CSRF_HEADER] = csrf;
  }
  return config;
});

/** One refresh at a time; concurrent 401s wait for the same promise. */
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const csrf = await ensureCsrfToken();
  try {
    const response = await axios.post(
      `${API_BASE_URL}${REFRESH_PATH}`,
      {},
      { withCredentials: true, headers: csrf ? { [CSRF_HEADER]: csrf } : {} },
    );
    const access: string | undefined = response.data?.access;
    if (!access) return null;
    useAuthStore.getState().setAccessToken(access);
    return access;
  } catch {
    return null;
  }
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isRefreshCall = original?.url?.includes(REFRESH_PATH);

    if (error.response?.status !== 401 || !original || original._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshing = refreshing ?? refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const access = await refreshing;

    if (!access) {
      // The session is over. The store clears; the route guard redirects, so
      // the client does not navigate behind React's back.
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    original.headers = { ...original.headers, Authorization: `Bearer ${access}` };
    return apiClient(original);
  },
);

export default apiClient;
