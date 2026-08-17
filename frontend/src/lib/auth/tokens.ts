import { deleteCookie, readCookie, writeCookie } from "./cookies";

export const ACCESS_TOKEN_COOKIE = "dp_access_token";
export const REFRESH_TOKEN_COOKIE = "dp_refresh_token";

const ACCESS_TOKEN_FALLBACK_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_FALLBACK_MAX_AGE = 7 * 24 * 60 * 60;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

function getJwtMaxAgeSeconds(token: string, fallback: number): number {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return fallback;
    }

    const normalized = payloadPart.replaceAll("-", "+").replaceAll("_", "/");
    const payload = JSON.parse(atob(normalized)) as { exp?: number };

    if (typeof payload.exp !== "number") {
      return fallback;
    }

    return Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallback;
  }
}

export function persistAuthTokens(tokens: AuthTokens): void {
  writeCookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    getJwtMaxAgeSeconds(tokens.accessToken, ACCESS_TOKEN_FALLBACK_MAX_AGE),
  );
  writeCookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    getJwtMaxAgeSeconds(tokens.refreshToken, REFRESH_TOKEN_FALLBACK_MAX_AGE),
  );
}

export function getAccessToken(): string | null {
  return readCookie(ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(): string | null {
  return readCookie(REFRESH_TOKEN_COOKIE);
}

export function clearAuthTokens(): void {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
}

export function hasAuthSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}
