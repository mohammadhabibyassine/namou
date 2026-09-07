export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/",
): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, "https://namou.invalid");
    return parsed.origin === "https://namou.invalid"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
