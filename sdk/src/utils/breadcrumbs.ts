import type { Breadcrumb, BreadcrumbLevel } from "../types/index.js";

export class BreadcrumbStore {
  private readonly maxItems: number;
  private items: Breadcrumb[] = [];

  constructor(maxItems = 25) {
    this.maxItems = maxItems;
  }

  add(
    message: string,
    category = "default",
    level: BreadcrumbLevel = "info",
    data?: Record<string, unknown>,
  ): void {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level,
      ...(data ? { data } : {}),
    };

    this.items = [...this.items, breadcrumb].slice(-this.maxItems);
  }

  list(): Breadcrumb[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}
