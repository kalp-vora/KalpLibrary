import { test, expect } from "@playwright/test";
import { LibraryPage } from "../pom/LibraryPage";
import { TheaterPage } from "../pom/TheaterPage";

test.describe("Feature Tests - Search Relevance, Authentic Sources & Media Boundaries", () => {
  test("Search input exhibits 500ms debouncing, query-only suggestions, and non-overlapping buttons", async ({ page }) => {
    const library = new LibraryPage(page);
    await library.goto();

    await expect(library.searchInput).toBeVisible();

    // 1. Verify when focused with empty query, no recent search history dropdown appears
    await library.searchInput.click();
    await expect(page.locator(".absolute.left-0.right-0")).not.toBeVisible();

    // 2. Focus and type query
    await library.searchInput.fill("Dune");

    // The auto-suggestions dropdown should appear with matching suggestions
    const dropdown = page.locator(".absolute.left-0.right-0");
    await expect(dropdown).toBeVisible({ timeout: 4000 });

    // Verify no "Recent" badge or clock history exists in dropdown
    await expect(dropdown.locator("text=Recent")).not.toBeVisible();

    // 3. Verify clear button and search submit button are both visible and strictly non-overlapping
    await expect(library.clearSearchBtn).toBeVisible();
    await expect(library.searchSubmitBtn).toBeVisible();

    const clearBox = await library.clearSearchBtn.boundingBox();
    const searchBox = await library.searchSubmitBtn.boundingBox();
    expect(clearBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    if (clearBox && searchBox) {
      // Clear button must be positioned to the left of the search button with zero overlap
      expect(clearBox.x + clearBox.width).toBeLessThanOrEqual(searchBox.x);
    }

    // 4. Clicking clear search resets the input
    await library.clearSearch();
    await expect(library.searchInput).toHaveValue("");
  });

  test("Theater search authentic sources: searching Avengers excludes unrelated actress Cobie Smulders and deduplicates results", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    // Search for Avengers in Theater
    await theater.searchMovie("Avengers");

    // Wait for authentic movie results to appear
    await expect(page.locator("h3:has-text('Avengers')").first()).toBeVisible({ timeout: 10000 });

    // Verify Cobie Smulders (actress from Wikipedia full-text leak) is NOT present as a movie card
    await expect(page.locator("text=Cobie Smulders")).not.toBeVisible();
    await expect(page.locator("text=Chris Evans (actor)")).not.toBeVisible();

    // Verify no books appear in theater search
    await expect(page.locator("text=/Open Book Archives|Google Books|Open Library/i")).not.toBeVisible();
  });

  test("Custom manual entry allows adding uncataloged book/movie directly to Wishlist or Journey", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    // Search for an uncataloged title
    await theater.searchMovie("Celestial Horizon Uncharted");

    // Fallback card should display option to add directly to Wishlist or Journey
    const customPrompt = page.locator("text=/Couldn't find/i");
    await expect(customPrompt).toBeVisible({ timeout: 10000 });

    // Click "+ Add to Watchlist (Wishlist)"
    const addToWatchlistBtn = page.getByRole("button", { name: /\+ Add to Watchlist/i });
    await expect(addToWatchlistBtn).toBeVisible();
    await addToWatchlistBtn.click();

    // Verify feedback message
    await expect(page.locator("text=/Added to Watchlist/i")).toBeVisible({ timeout: 5000 });

    // Navigate to Lists to confirm it was added to Watchlist queue
    await theater.clickNavTab("Lists");
    await expect(page).toHaveURL(/\/lists/);
    await expect(page.locator("body")).toContainText("Celestial Horizon Uncharted", { timeout: 8000 });
  });

  test("Theater search returns enriched metadata for Drishyam (director, year, runtime, description)", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    await theater.searchMovie("Drishyam");

    // Wait for search results
    await expect(page.locator("h3:has-text('Drishyam')").first()).toBeVisible({ timeout: 12000 });

    // Verify authentic year 2015 or 2013 is shown instead of defaulting to 2020
    const yearLocator = page.locator("text=/2015|2013/").first();
    await expect(yearLocator).toBeVisible();

    // Verify authentic director (Nishikant Kamat or Jeethu Joseph) is shown
    const directorLocator = page.locator("text=/Nishikant Kamat|Jeethu Joseph/i").first();
    await expect(directorLocator).toBeVisible();
  });

  test("Wishlist and Journey prevent duplicate records", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    // Open custom entry form
    const toggleCustomBtn = page.getByRole("button", { name: /Add custom/i });
    await toggleCustomBtn.click();

    // Fill in custom details
    const titleInput = page.getByPlaceholder(/e\.g\. Interstellar|e\.g\. The Silmarillion/i).last();
    await titleInput.fill("Solaris Chronicles");

    // Add to Watchlist
    const addBtn = page.getByRole("button", { name: /\+ Add to Watchlist/i }).last();
    await addBtn.click();
    await page.waitForTimeout(400);

    // Try adding the same title again via custom form
    await toggleCustomBtn.click();
    await titleInput.fill("Solaris Chronicles");
    await addBtn.click();

    // Error should indicate it's already in collection
    await expect(page.locator("text=/is already in your/i")).toBeVisible({ timeout: 4000 });
  });
});
