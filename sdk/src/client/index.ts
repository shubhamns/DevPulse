import { normalizeError, normalizeMessage } from "../capture/index.js";
import { DEFAULT_ENDPOINT, sendEvent } from "../transport/index.js";
import type {
  DevPulseContext,
  DevPulseEventPayload,
  DevPulseInitOptions,
  DevPulseUser,
} from "../types/index.js";
import { BreadcrumbStore } from "../utils/breadcrumbs.js";
import { getRuntimeInfo } from "../utils/runtime.js";

export const SDK_NAME = "@devpulse/sdk";
export const SDK_VERSION = "0.1.0";

export class DevPulseClient {
  private apiKey = "";
  private environment = "production";
  private release = "0.0.0";
  private endpoint = DEFAULT_ENDPOINT;
  private enabled = true;
  private user: DevPulseUser | null = null;
  private context: DevPulseContext = {};
  private readonly breadcrumbs: BreadcrumbStore;

  constructor(options?: DevPulseInitOptions) {
    this.breadcrumbs = new BreadcrumbStore(options?.maxBreadcrumbs ?? 25);

    if (options) {
      this.configure(options);
    }
  }

  init(options: DevPulseInitOptions): void {
    this.configure(options);
  }

  setUser(user: DevPulseUser | null): void {
    this.user = user;

    if (user) {
      this.breadcrumbs.add("User context updated", "user", "info", { id: user.id });
    } else {
      this.breadcrumbs.add("User context cleared", "user", "info");
    }
  }

  setContext(context: DevPulseContext): void {
    this.context = {
      ...this.context,
      ...context,
    };
    this.breadcrumbs.add("Context updated", "context", "info", context);
  }

  captureException(error: unknown): void {
    if (!this.canCapture()) {
      return;
    }

    const normalized = normalizeError(error);
    this.breadcrumbs.add(normalized.message, "exception", "error", {
      name: normalized.name,
    });

    const payload = this.buildPayload("exception", normalized.message, {
      error: normalized,
      level: "error",
    });

    void sendEvent(this.endpoint, this.apiKey, payload);
  }

  captureMessage(message: string, level = "info"): void {
    if (!this.canCapture()) {
      return;
    }

    const normalized = normalizeMessage(message);
    this.breadcrumbs.add(normalized, "message", "info");

    const payload = this.buildPayload("message", normalized, { level });
    void sendEvent(this.endpoint, this.apiKey, payload);
  }

  private configure(options: DevPulseInitOptions): void {
    if (!options.apiKey?.startsWith("dp_live_")) {
      console.warn("[DevPulse] A valid dp_live_ API key is required.");
    }

    this.apiKey = options.apiKey;
    this.environment = options.environment ?? "production";
    this.release = options.release ?? "0.0.0";
    this.endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.enabled = options.enabled ?? true;

    if (options.maxBreadcrumbs !== undefined) {
      this.breadcrumbs.clear();
    }
  }

  private canCapture(): boolean {
    if (!this.enabled) {
      return false;
    }

    if (!this.apiKey) {
      console.warn("[DevPulse] SDK not initialized. Call DevPulse.init() first.");
      return false;
    }

    return true;
  }

  private buildPayload(
    type: DevPulseEventPayload["type"],
    message: string,
    extras: Pick<DevPulseEventPayload, "error" | "level"> = {},
  ): DevPulseEventPayload {
    const runtime = getRuntimeInfo();

    return {
      type,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      message,
      ...(extras.level ? { level: extras.level } : {}),
      ...(extras.error ? { error: extras.error } : {}),
      ...(runtime.url ? { url: runtime.url } : {}),
      ...(runtime.browser ? { browser: runtime.browser } : {}),
      ...(runtime.os ? { os: runtime.os } : {}),
      ...(this.user ? { user: this.user } : {}),
      ...(Object.keys(this.context).length > 0 ? { context: this.context } : {}),
      breadcrumbs: this.breadcrumbs.list(),
      sdk: {
        name: SDK_NAME,
        version: SDK_VERSION,
      },
    };
  }
}

const defaultClient = new DevPulseClient();

export const DevPulse = {
  name: SDK_NAME,
  version: SDK_VERSION,
  init(options: DevPulseInitOptions): void {
    defaultClient.init(options);
  },
  setUser(user: DevPulseUser | null): void {
    defaultClient.setUser(user);
  },
  setContext(context: DevPulseContext): void {
    defaultClient.setContext(context);
  },
  captureException(error: unknown): void {
    defaultClient.captureException(error);
  },
  captureMessage(message: string, level?: string): void {
    defaultClient.captureMessage(message, level);
  },
};

export { DevPulseClient as Client };
