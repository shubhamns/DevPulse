const COOKIE_PREFIX_SEPARATOR = "=";

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}${COOKIE_PREFIX_SEPARATOR}`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(prefix.length));
}

export function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string): void {
  writeCookie(name, "", 0);
}
