import { beforeEach, describe, expect, it } from "vitest";
import { createGuestCommerceStore } from "./guest-commerce-store";

const cartItem = {
  variantId: "11111111-1111-4111-8111-111111111111",
  productId: "22222222-2222-4222-8222-222222222222",
  title: "Technical Jacket",
  slug: "technical-jacket",
  imageUrl: null,
  sku: "NMU-JK-2401",
  options: [{ attributeType: "Color", value: "Black" }],
  unitPrice: "420.00",
  currencyCode: "USD",
};

describe("guest commerce store", () => {
  beforeEach(() => localStorage.clear());

  it("coalesces repeated additions by variant", () => {
    const store = createGuestCommerceStore();
    store.getState().addCartItem(cartItem, 2);
    store.getState().addCartItem(cartItem, 3);

    expect(store.getState().cartItems).toHaveLength(1);
    expect(store.getState().cartItems[0]?.quantity).toBe(5);
  });

  it("clamps quantities to the backend contract", () => {
    const store = createGuestCommerceStore();
    store.getState().addCartItem(cartItem, 2_000);
    expect(store.getState().cartItems[0]?.quantity).toBe(999);
  });
});
