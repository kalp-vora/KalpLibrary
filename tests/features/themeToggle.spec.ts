import { test, expect } from "@playwright/test";
import { ConciergePage } from "../pom/ConciergePage";

test.describe("Feature Tests - Daylight / Night Theme Toggle", () => {
  test("Theme toggle button toggles dark/light mode and stores preference", async ({ page }) => {
    const concierge = new ConciergePage(page);
    await concierge.goto();

    const html = page.locator("html");
    const wasDark = await html.evaluate((el) => el.classList.contains("dark"));

    // Toggle theme
    await concierge.toggleTheme();

    if (wasDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Verify localStorage persistence
    const storedTheme = await page.evaluate(() => localStorage.getItem("kalp_theme"));
    expect(["dark", "light"]).toContain(storedTheme);
  });
});
