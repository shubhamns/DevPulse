export type DevPulseInitOptions = {
  apiKey: string;
  environment?: string;
  release?: string;
  endpoint?: string;
  enabled?: boolean;
  maxBreadcrumbs?: number;
};

export type DevPulseUser = {
  id: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
};

export type DevPulseContext = Record<string, unknown>;

export type BreadcrumbLevel = "debug" | "info" | "warning" | "error";

export type Breadcrumb = {
  timestamp: string;
  category: string;
  message: string;
  level: BreadcrumbLevel;
  data?: Record<string, unknown>;
};

export type DevPulseEventType = "exception" | "message" | "test";

export type DevPulseErrorPayload = {
  name: string;
  message: string;
  stack?: string;
};

export type DevPulseEventPayload = {
  type: DevPulseEventType;
  timestamp: string;
  environment: string;
  release: string;
  message: string;
  level?: string;
  error?: DevPulseErrorPayload;
  url?: string;
  browser?: string;
  os?: string;
  user?: DevPulseUser;
  context?: DevPulseContext;
  breadcrumbs?: Breadcrumb[];
  sdk: {
    name: string;
    version: string;
  };
};

export type RuntimeInfo = {
  url?: string;
  browser?: string;
  os?: string;
};

export type NormalizedError = DevPulseErrorPayload;
