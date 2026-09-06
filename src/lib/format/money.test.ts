import { describe, expect, it } from "vitest";
import { multiplyMoney, sumMoney } from "./money";

describe("money helpers", () => {
  it("uses decimal arithmetic for line totals", () => {
    expect(multiplyMoney("0.10", 3)).toBe("0.30");
  });

  it("sums backend money strings without floating-point drift", () => {
    expect(sumMoney(["0.10", "0.20", "1.05"])).toBe("1.35");
  });
});
