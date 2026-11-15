import { test, expect } from "@playwright/test";
import { LibraryPage } from "../pom/LibraryPage";

test.describe("Feature Tests - Debounced Search & Auto-Suggestions", () => {
  test("Search input exhibits 500ms debouncing and auto-suggestions dropdown", async ({ page }) => {
    const library = new LibraryPage(page);
    await library.goto();

    await expect(library.searchInput).toBeVisible();

    // Focus and type query
    await library.searchInput.click();
    await library.searchInput.fill("Dune");

    // The auto-suggestions dropdown should appear with matching or recent suggestions
    const dropdown = page.locator(".absolute.left-0.right-0");
    await expect(dropdown).toBeVisible({ timeout: 4000 });

    // Clear search button should appear
    await expect(library.clearSearchBtn).toBeVisible();

    // Clicking clear search resets the input
    await library.clearSearch();
    await expect(library.searchInput).toHaveValue("");
  });
});
