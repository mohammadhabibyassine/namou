import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps relative application destinations", () => {
    expect(safeRedirectPath("/checkout?step=review")).toBe(
      "/checkout?step=review",
    );
  });

  it("rejects absolute and protocol-relative destinations", () => {
    expect(safeRedirectPath("https://attacker.test")).toBe("/");
    expect(safeRedirectPath("//attacker.test/path")).toBe("/");
  });
});
