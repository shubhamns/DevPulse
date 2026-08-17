import type { RuntimeInfo } from "../types/index.js";

function detectBrowser(userAgent: string): string | undefined {
  if (/Edg\//i.test(userAgent)) {
    return "Edge";
  }
  if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) {
    return "Chrome";
  }
  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }
  if (/Safari\//i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    return "Safari";
  }
  return undefined;
}

function detectOs(userAgent: string): string | undefined {
  if (/Windows NT/i.test(userAgent)) {
    return "Windows";
  }
  if (/Mac OS X/i.test(userAgent)) {
    return "macOS";
  }
  if (/Android/i.test(userAgent)) {
    return "Android";
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }
  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }
  return undefined;
}

export function getRuntimeInfo(): RuntimeInfo {
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent;
    const info: RuntimeInfo = { url: window.location.href };
    const browser = detectBrowser(userAgent);
    const os = detectOs(userAgent);

    if (browser) {
      info.browser = browser;
    }

    if (os) {
      info.os = os;
    }

    return info;
  }

  if (typeof process !== "undefined" && process.release?.name) {
    return {
      browser: "node",
      os: process.platform,
    };
  }

  return {};
}
