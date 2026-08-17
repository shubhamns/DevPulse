import { z } from "zod";
import { AppError } from "./errors.js";

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}

export function parseInput<T>(
  schema: z.ZodType<T>,
  data: unknown,
  statusCode = 400,
): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new AppError(
      statusCode,
      statusCode === 401 ? "UNAUTHORIZED" : "VALIDATION_ERROR",
      formatZodError(parsed.error),
    );
  }

  return parsed.data;
}
