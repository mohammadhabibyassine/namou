import { describe, expect, it } from "vitest";
import { hasTrustedOrigin } from "./request-security";

describe("mutation origin checks", () => {
  it("accepts same-origin browser mutations", () => {
    const request = new Request("https://namou.test/api/backend/cart/items", {
      method: "POST",
      headers: {
        origin: "https://namou.test",
        "sec-fetch-site": "same-origin",
      },
    });
    expect(hasTrustedOrigin(request)).toBe(true);
  });

  it("rejects cross-origin mutations", () => {
    const request = new Request("https://namou.test/api/backend/cart/items", {
      method: "POST",
      headers: { origin: "https://attacker.test" },
    });
    expect(hasTrustedOrigin(request)).toBe(false);
  });
});
