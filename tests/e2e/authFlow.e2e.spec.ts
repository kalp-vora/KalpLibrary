import { test, expect } from "@playwright/test";
import { LoginPage } from "../pom/LoginPage";

test.describe("E2E Tests - Authentication Protection & Routing", () => {
  test("Unauthenticated user is redirected to /login when visiting protected routes", async ({ page }) => {
    const login = new LoginPage(page);
    await login.clearAuthCookies();

    // Visit /library without auth cookie
    await page.goto("/library");
    await expect(page).toHaveURL(/\/login(\?from=.*)?/);

    // Visit /theater without auth cookie
    await page.goto("/theater");
    await expect(page).toHaveURL(/\/login(\?from=.*)?/);

    // Visit /lists without auth cookie
    await page.goto("/lists");
    await expect(page).toHaveURL(/\/login(\?from=.*)?/);

    // Visit /journey without auth cookie
    await page.goto("/journey");
    await expect(page).toHaveURL(/\/login(\?from=.*)?/);
  });

  test("Authenticated user is redirected away from /login to main application", async ({ page }) => {
    const login = new LoginPage(page);
    await login.setAuthCookies();

    // Visit /login with auth cookie present
    await page.goto("/login");
    await expect(page).toHaveURL(/\/(#.*)?$/);
  });
});
