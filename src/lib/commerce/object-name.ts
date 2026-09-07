/** Returns a stable storefront label even when a legacy record has no title. */
export function objectName(title: string | null | undefined, slug = "") {
  const normalized = title?.trim();
  if (normalized) return normalized;
  const fallback = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
  return fallback || "Unnamed object";
}
