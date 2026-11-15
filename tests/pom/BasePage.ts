import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object Model for Kalp Library
 * Provides common navigation, theme toggling, and authentication helpers.
 */
export class BasePage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly themeToggleBtn: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator("nav");
    this.themeToggleBtn = page.locator("button[aria-label*='Switch to']");
    this.footer = page.locator("footer");
  }

  /**
   * Sets authenticated test session cookies to bypass login during automated tests.
   */
  async setAuthCookies() {
    await this.page.context().addCookies([
      {
        name: "kalp_auth",
        value: "1",
        domain: "localhost",
        path: "/",
      },
      {
        name: "kalp_test_auth",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);
  }

  /**
   * Clears all session cookies.
   */
  async clearAuthCookies() {
    await this.page.context().clearCookies();
  }

  /**
   * Navigates to a specific route with optional authenticated session.
   */
  async navigateTo(path: string, authenticated: boolean = true) {
    if (authenticated) {
      await this.setAuthCookies();
    }
    await this.page.goto(path);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Clicks a primary navigation tab in Navbar.
   */
  async clickNavTab(tabName: "Concierge" | "Library" | "Theater" | "Lists" | "Journey") {
    const routeMap: Record<string, string> = {
      Concierge: "/",
      Library: "/library",
      Theater: "/theater",
      Lists: "/lists",
      Journey: "/journey",
    };
    const href = routeMap[tabName] || "/";
    const tabLink = this.navbar.locator(`a[href='${href}']`).first();
    await tabLink.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Toggles theme between Daylight and Night.
   */
  async toggleTheme() {
    await this.themeToggleBtn.click();
  }

  /**
   * Verifies current HTML theme attribute.
   */
  async expectTheme(theme: "dark" | "light") {
    const html = this.page.locator("html");
    await expect(html).toHaveClass(new RegExp(theme));
  }
}
