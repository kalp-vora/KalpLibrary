import { test, expect } from "@playwright/test";
import { LoginPage } from "../pom/LoginPage";
import { ConciergePage } from "../pom/ConciergePage";
import { LibraryPage } from "../pom/LibraryPage";
import { TheaterPage } from "../pom/TheaterPage";
import { ListsPage } from "../pom/ListsPage";
import { JourneyPage } from "../pom/JourneyPage";

test.describe("Smoke Tests - Route Availability & Critical UI Elements", () => {
  test("Login page loads with Sign In and Register options", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveTitle(/kalp library \| books, cinema and more/i);
    await expect(loginPage.signInTab).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.googleSignInButton).toBeVisible();
  });

  test("Concierge / Home page loads with personalized greeting & recommendations", async ({ page }) => {
    const concierge = new ConciergePage(page);
    await concierge.goto();

    await expect(page).toHaveTitle(/kalp library \| books, cinema and more/i);
    await expect(concierge.greetingHeader).toBeVisible();
    await expect(concierge.moodChips.first()).toBeVisible();
    await expect(concierge.dailyQuoteCard).toBeVisible();
  });

  test("Library page loads with collection header and online search input", async ({ page }) => {
    const library = new LibraryPage(page);
    await library.goto();

    await expect(library.searchInput).toBeVisible();
    await expect(page.locator("h2:has-text('Your Book Collection')")).toBeVisible();
  });

  test("Theater page loads with screen category filters and projector spotlight", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    await expect(theater.allScreenTab).toBeVisible();
    await expect(theater.moviesTab).toBeVisible();
    await expect(theater.tvSeriesTab).toBeVisible();
    await expect(theater.nowShowingSpotlight).toBeVisible();
  });

  test("Lists page loads with ReadList and Watchlist queue sections", async ({ page }) => {
    const lists = new ListsPage(page);
    await lists.goto();

    await expect(page.locator("h1:has-text('Watchlist & ReadList')")).toBeVisible();
    await expect(page.locator("button:has-text('ReadList')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Watchlist')").first()).toBeVisible();
  });

  test("Journey page loads with reflections bookshelf and milestones summary", async ({ page }) => {
    const journey = new JourneyPage(page);
    await journey.goto();

    await expect(journey.pageTitle).toBeVisible();
    await expect(journey.milestonesReachedCount).toBeVisible();
    await expect(journey.booksReadCount).toBeVisible();
  });

  test("Legacy redirects function correctly", async ({ page }) => {
    const base = new LoginPage(page);
    await base.setAuthCookies();

    // Verify /completed redirects to /journey
    await page.goto("/completed");
    await expect(page).toHaveURL(/\/journey/);

    // Verify /concierge redirects to /
    await page.goto("/concierge");
    await expect(page).toHaveURL(/\/(#.*)?$/);
  });
});
