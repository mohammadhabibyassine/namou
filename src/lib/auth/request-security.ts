export function isMutationMethod(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

export function hasTrustedOrigin(
  request: Request,
  trustedOrigin = new URL(request.url).origin,
): boolean {
  if (!isMutationMethod(request.method)) return true;

  const origin = request.headers.get("origin");
  if (origin && origin !== trustedOrigin) return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
}
