import { z } from "zod";

const breadcrumbSchema = z.object({
  timestamp: z.string().datetime(),
  category: z.string().min(1).max(120),
  message: z.string().min(1).max(1000),
  level: z.enum(["debug", "info", "warning", "error"]),
  data: z.record(z.string(), z.unknown()).optional(),
});

const errorSchema = z.object({
  name: z.string().min(1).max(256),
  message: z.string().min(1).max(4000),
  stack: z.string().max(20000).optional(),
});

const userSchema = z
  .object({
    id: z.string().min(1).max(256),
  })
  .catchall(z.unknown());

export const ingestEventSchema = z
  .object({
    type: z.enum(["exception", "message", "test"]),
    timestamp: z.string().datetime(),
    environment: z.string().min(1).max(64),
    release: z.string().max(64).default(""),
    message: z.string().min(1).max(4000),
    level: z.string().max(32).optional(),
    error: errorSchema.optional(),
    url: z.string().max(2048).optional(),
    browser: z.string().max(120).optional(),
    os: z.string().max(120).optional(),
    user: userSchema.optional(),
    context: z.record(z.string(), z.unknown()).optional(),
    breadcrumbs: z.array(breadcrumbSchema).max(50).optional(),
    sdk: z.object({
      name: z.string().min(1).max(120),
      version: z.string().min(1).max(64),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.type === "exception" && !value.error) {
      ctx.addIssue({
        code: "custom",
        message: "Exception events must include error details",
        path: ["error"],
      });
    }
  });

export type IngestEventInput = z.infer<typeof ingestEventSchema>;
