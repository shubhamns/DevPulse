import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini"),
  GITHUB_CLIENT_ID: z.string().optional().default(""),
  GITHUB_CLIENT_SECRET: z.string().optional().default(""),
  GITHUB_CALLBACK_URL: z
    .string()
    .optional()
    .default("http://localhost:4000/api/v1/github/callback"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  EVENT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  EVENT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
});

export type Env = z.infer<typeof envSchema>;

const WEAK_JWT_SECRETS = new Set([
  "replace-with-a-long-random-secret",
  "devpulse-secret",
  "changeme",
  "secret",
]);

function validateProductionEnv(env: Env): void {
  if (env.NODE_ENV !== "production") {
    return;
  }

  if (env.JWT_SECRET.length < 32 || WEAK_JWT_SECRETS.has(env.JWT_SECRET)) {
    throw new Error(
      "Invalid environment configuration: JWT_SECRET must be at least 32 characters and not a default placeholder in production",
    );
  }

  if (env.MONGODB_URI.startsWith("mongodb://127.0.0.1") || env.MONGODB_URI.includes("localhost")) {
    throw new Error(
      "Invalid environment configuration: use MongoDB Atlas or a managed MongoDB URI in production",
    );
  }
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  validateProductionEnv(parsed.data);

  return parsed.data;
}
