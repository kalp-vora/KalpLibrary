import { test, expect } from "@playwright/test";
import { TheaterPage } from "../pom/TheaterPage";
import { DetailModalPom, ReviewModalPom } from "../pom/ModalsPom";

test.describe("E2E Tests - Screen Media Lifecycle & Theater Switcher", () => {
  test("Search movies, filter categories, and verify cinema layout", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    // 1. Verify category tabs exist and can be toggled
    await theater.switchCategory("movies");
    await expect(theater.moviesTab).toHaveClass(/bg-brand-primary/);

    await theater.switchCategory("tv");
    await expect(theater.tvSeriesTab).toHaveClass(/bg-brand-primary/);

    await theater.switchCategory("anime");
    await expect(theater.animeTab).toHaveClass(/bg-brand-primary/);

    await theater.switchCategory("all");
    await expect(theater.allScreenTab).toHaveClass(/bg-brand-primary/);

    // 2. Search online film
    await theater.searchMovie("Inception");

    // Wait for search results and click "+ Add to Watchlist"
    const addBtn = page.getByRole("button", { name: "+ Add to Watchlist" }).first();
    await expect(addBtn).toBeVisible({ timeout: 12000 });
    await addBtn.click();

    // Verify feedback appears
    await expect(page.locator("text=/Added to/i").first()).toBeVisible({ timeout: 5000 });

    // 3. Navigate to Lists to verify it appears in Watchlist queue
    await theater.clickNavTab("Lists");
    await expect(page).toHaveURL(/\/lists/);
    await expect(page.locator("body")).toContainText(/Inception/i, { timeout: 8000 });

    // 4. Open Detail modal by clicking Details
    const detailsBtn = page.getByRole("button", { name: "Details" }).first();
    await detailsBtn.click();

    const detailModal = new DetailModalPom(page);
    await expect(detailModal.modal).toBeVisible();
    await detailModal.close();
  });

  test("Marking movie as completed prompts for rating and thoughts with ReviewModal", async ({ page }) => {
    const theater = new TheaterPage(page);
    await theater.goto();

    // Search online film
    await theater.searchMovie("Inception");

    // Add to Watchlist
    const addBtn = page.getByRole("button", { name: "+ Add to Watchlist" }).first();
    await expect(addBtn).toBeVisible({ timeout: 12000 });
    await addBtn.click();

    // Navigate to Lists to see it in queue
    await theater.clickNavTab("Lists");
    await expect(page).toHaveURL(/\/lists/);
    await expect(page.locator("body")).toContainText(/Inception/i, { timeout: 8000 });

    // Click "Mark Watched"
    const markWatchedBtn = page.getByRole("button", { name: /Mark Watched/i }).first();
    await expect(markWatchedBtn).toBeVisible({ timeout: 5000 });
    await markWatchedBtn.click();

    // Verify ReviewModal opens with "Screening Complete"
    const reviewModal = new ReviewModalPom(page);
    await expect(reviewModal.modal).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=/Screening Complete/i")).toBeVisible();

    // Fill rating and thoughts
    await reviewModal.setRating(5);
    await reviewModal.fillReview(
      "Mind-bending dream layers and stunning visual design",
      "One of the greatest sci-fi films ever made.",
      "An idea is like a virus."
    );
    await reviewModal.submit();
    await expect(reviewModal.modal).not.toBeVisible({ timeout: 5000 });

    // Navigate to Journey to verify it's recorded
    await theater.clickNavTab("Journey");
    await expect(page).toHaveURL(/\/journey/);
    await expect(page.locator("body")).toContainText(/Inception/i, { timeout: 8000 });
  });
});
