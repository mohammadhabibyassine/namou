import { describe, expect, it } from "vitest";
import { findRoutePolicy } from "./policy";

describe("backend BFF allowlist", () => {
  it("exposes public catalog reads", () => {
    expect(findRoutePolicy("/products", "GET")?.requiresAuth).toBe(false);
  });

  it("requires authentication for cart mutations", () => {
    expect(findRoutePolicy("/cart/items", "POST")?.requiresAuth).toBe(true);
  });

  it("never acts as an open proxy", () => {
    expect(findRoutePolicy("/docs/openapi.json", "GET")).toBeNull();
    expect(findRoutePolicy("/auth/login", "POST")).toBeNull();
  });
});
