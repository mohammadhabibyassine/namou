import { describe, expect, it } from "vitest";
import { clampQuantity } from "./quantity";

describe("clampQuantity", () => {
  it("caps an existing quantity when a variant has less stock", () => {
    expect(clampQuantity(13, 8)).toBe(8);
  });

  it("keeps quantity inside the valid one-to-max range", () => {
    expect(clampQuantity(0, 8)).toBe(1);
    expect(clampQuantity(4, 8)).toBe(4);
    expect(clampQuantity(10, 0)).toBe(1);
  });
});
