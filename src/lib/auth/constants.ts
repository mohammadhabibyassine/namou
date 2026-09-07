const production = process.env.NODE_ENV === "production";

export const authCookieNames = {
  access: production ? "__Host-namou.access" : "namou.access",
  refresh: production ? "__Host-namou.refresh" : "namou.refresh",
  session: production ? "__Host-namou.session" : "namou.session",
} as const;

export const protectedRoutePrefixes = [
  "/account",
  "/checkout",
  "/orders",
  "/order-confirmation",
  "/admin",
] as const;
