import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  persistAuthSession,
  type AuthTokens,
} from "@/lib/auth";
import { ApiError, type ApiErrorBody } from "./error";

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_SKIP_REFRESH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
];

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data;

  return new ApiError(
    status,
    payload?.error?.code ?? "REQUEST_FAILED",
    payload?.error?.message ?? error.message ?? "Request failed",
  );
}

function shouldSkipRefresh(url?: string): boolean {
  if (!url) {
    return false;
  }

  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

export function registerAuthInterceptors(
  http: AxiosInstance,
  refreshHttp: AxiosInstance,
): void {
  let refreshRequest: Promise<boolean> | null = null;

  async function rotateAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const { data } = await refreshHttp.post<AuthTokens>("/api/v1/auth/refresh", {
      refreshToken,
    });

    persistAuthSession(data);
    return true;
  }

  function refreshSession(): Promise<boolean> {
    if (!refreshRequest) {
      refreshRequest = rotateAccessToken()
        .catch(() => false)
        .finally(() => {
          refreshRequest = null;
        });
    }

    return refreshRequest;
  }

  http.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
      const original = error.config as RetryRequestConfig | undefined;
      const status = error.response?.status;

      if (!original || status !== 401 || original._retry || shouldSkipRefresh(original.url)) {
        return Promise.reject(toApiError(error));
      }

      original._retry = true;
      const refreshed = await refreshSession();

      if (!refreshed) {
        clearAuthSession();
        return Promise.reject(toApiError(error));
      }

      const accessToken = getAccessToken();

      if (accessToken) {
        original.headers.Authorization = `Bearer ${accessToken}`;
      }

      return http.request(original);
    },
  );
}
