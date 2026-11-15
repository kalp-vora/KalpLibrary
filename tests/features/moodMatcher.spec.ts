import { test, expect } from "@playwright/test";
import { ConciergePage } from "../pom/ConciergePage";

test.describe("Feature Tests - Concierge Atmospheric Recommendations & Quotes", () => {
  test("Selecting different mood chips switches genre recommendations", async ({ page }) => {
    const concierge = new ConciergePage(page);
    await concierge.goto();

    // Select 'Sci-Fi'
    await concierge.selectMood("Sci-Fi");
    await page.waitForTimeout(400);

    // Verify recommendations update
    await expect(page.locator("h3:has-text('Sci-Fi'), div:has-text('Sci-Fi')").first()).toBeVisible();

    // Select 'Philosophy'
    await concierge.selectMood("Philosophy");
    await page.waitForTimeout(400);
    await expect(page.locator("h3:has-text('Philosophy'), div:has-text('Philosophy')").first()).toBeVisible();
  });

  test("Copy quote button provides feedback to user", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const concierge = new ConciergePage(page);
    await concierge.goto();

    await expect(concierge.copyQuoteButton).toBeVisible();
    await concierge.copyQuote();

    // Verify checkmark icon appears to indicate copied state
    await expect(page.locator(".lucide-check")).toBeVisible({ timeout: 3000 });
  });
});
