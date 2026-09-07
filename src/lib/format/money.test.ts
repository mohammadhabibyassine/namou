import { describe, expect, it } from "vitest";
import { formatMoney, multiplyMoney, sumMoney } from "./money";

describe("money helpers", () => {
  it("uses decimal arithmetic for line totals", () => {
    expect(multiplyMoney("0.10", 3)).toBe("0.30");
  });

  it("sums backend money strings without floating-point drift", () => {
    expect(sumMoney(["0.10", "0.20", "1.05"])).toBe("1.35");
  });

  it("formats the currency supplied by the product", () => {
    expect(formatMoney("12.50", "EUR", "de-DE")).toContain("12,50");
    expect(formatMoney("12.50", "EUR", "de-DE")).toContain("€");
  });
});
