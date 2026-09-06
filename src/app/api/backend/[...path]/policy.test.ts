import { describe, expect, it } from "vitest";
import { findRoutePolicy } from "./policy";

describe("backend BFF allowlist", () => {
  it("exposes public catalog reads", () => {
    expect(findRoutePolicy("/products", "GET")?.requiresAuth).toBe(false);
  });

  it("requires authentication for cart mutations", () => {
    expect(findRoutePolicy("/cart/items", "POST")?.requiresAuth).toBe(true);
  });

  it("exposes only product-scoped upload operations", () => {
    const productId = "550e8400-e29b-41d4-a716-446655440000";
    expect(
      findRoutePolicy(
        `/uploads/products/${productId}/presigned-url`,
        "POST",
      )?.requiresAuth,
    ).toBe(true);
    expect(
      findRoutePolicy(`/uploads/products/${productId}`, "DELETE")
        ?.requiresAuth,
    ).toBe(true);
    expect(findRoutePolicy("/uploads/presigned-url", "POST")).toBeNull();
  });

  it("never acts as an open proxy", () => {
    expect(findRoutePolicy("/docs/openapi.json", "GET")).toBeNull();
    expect(findRoutePolicy("/auth/login", "POST")).toBeNull();
  });
});
