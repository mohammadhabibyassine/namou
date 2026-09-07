import { expect, test } from "@playwright/test";

test("home renders the selected kinetic direction without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Move different." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /shop drop 02/i })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test("guest cart hydrates and updates without authentication", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "namou.guest-commerce",
      JSON.stringify({
        state: {
          cartItems: [
            {
              variantId: "11111111-1111-4111-8111-111111111111",
              productId: "22222222-2222-4222-8222-222222222222",
              title: "Technical Shell 01",
              slug: "technical-shell-01",
              imageUrl: null,
              sku: "NMU-JK-2401",
              options: [
                { attributeType: "Color", value: "Black" },
                { attributeType: "Size", value: "M" },
              ],
              unitPrice: "420.00",
              currencyCode: "USD",
              quantity: 1,
            },
          ],
          wishlistItems: [],
        },
        version: 1,
      }),
    );
  });
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart / 01" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Technical Shell 01" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Increase Quantity" }).click();
  await expect(
    page.locator('output[aria-label="Quantity: 2"]:visible'),
  ).toBeVisible();
});

test("login exposes accessible validation feedback", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign In to System" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("protected checkout preserves the anonymous user's destination", async ({
  page,
}) => {
  await page.goto("/checkout?step=review");
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout%3Fstep%3Dreview$/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("catalog remains usable with the configured product service", async ({
  page,
}) => {
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "All objects" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Product results" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test("unknown routes render the branded recoverable 404", async ({ page }) => {
  await page.goto("/missing-system-route");
  await expect(
    page.getByRole("heading", { name: "That page moved." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /re-enter system/i }),
  ).toBeVisible();
});
