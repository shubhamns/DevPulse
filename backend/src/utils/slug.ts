export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const normalized = slugify(base) || "item";
  let candidate = normalized;
  let suffix = 1;

  while (await exists(candidate)) {
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
