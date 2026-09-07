import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { authCookieNames } from "@/lib/auth/constants";
import { proxy } from "./proxy";

describe("route proxy", () => {
  it("keeps public storefront routes public", () => {
    const response = proxy(new NextRequest("https://namou.test/shop"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects anonymous users and preserves their destination", () => {
    const response = proxy(
      new NextRequest("https://namou.test/checkout?step=review"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://namou.test/login?next=%2Fcheckout%3Fstep%3Dreview",
    );
  });

  it("allows the protected layout to verify signed sessions", () => {
    const request = new NextRequest("https://namou.test/orders");
    request.cookies.set(authCookieNames.session, "signed-session-placeholder");

    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
