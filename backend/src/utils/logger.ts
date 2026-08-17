type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, extra?: unknown): string {
  const timestamp = new Date().toISOString();
  const payload =
    extra === undefined ? "" : ` ${typeof extra === "string" ? extra : JSON.stringify(extra)}`;
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`;
}

export const logger = {
  info(message: string, extra?: unknown): void {
    console.log(formatMessage("info", message, extra));
  },
  warn(message: string, extra?: unknown): void {
    console.warn(formatMessage("warn", message, extra));
  },
  error(message: string, extra?: unknown): void {
    console.error(formatMessage("error", message, extra));
  },
};
