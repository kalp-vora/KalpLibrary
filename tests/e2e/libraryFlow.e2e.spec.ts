import { test, expect } from "@playwright/test";
import { LibraryPage } from "../pom/LibraryPage";
import { DetailModalPom, ReviewModalPom } from "../pom/ModalsPom";

test.describe("E2E Tests - Complete Book Lifecycle (Search -> Queue -> Reading -> Review -> Journey)", () => {
  test("Search book, add to queue, open detail modal, and navigate lifecycle", async ({ page }) => {
    const library = new LibraryPage(page);
    await library.goto();

    // 1. Search online book
    await library.typeSearch("The Hobbit");
    await library.searchSubmitBtn.click();

    // Wait for online search results
    const resultCard = page.locator(".rounded-2xl.border.bg-surface-card").first();
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    // 2. Click Add to ReadList
    const addBtn = page.getByRole("button", { name: "+ Add to ReadList" }).first();
    await addBtn.click();
    await page.waitForTimeout(500);

    // 3. Navigate to Lists to verify it appears in queue
    await library.clickNavTab("Lists");
    await expect(page).toHaveURL(/\/lists/);
    await expect(page.locator("body")).toContainText(/The Hobbit/i, { timeout: 8000 });

    // 4. Click Details button to open DetailModal
    const detailsBtn = page.getByRole("button", { name: "Details" }).first();
    await detailsBtn.click();

    const detailModal = new DetailModalPom(page);
    await expect(detailModal.modal).toBeVisible();

    // 5. Change status to Active
    await detailModal.setStatus("active");
    await page.waitForTimeout(400);

    // 6. Open Review Modal
    await detailModal.openReview();

    const reviewModal = new ReviewModalPom(page);
    await expect(reviewModal.modal).toBeVisible();

    // 7. Complete review
    await reviewModal.setRating(5);
    await reviewModal.fillReview(
      "Courage is found in unexpected places.",
      "An enchanting classic tale.",
      "In a hole in the ground there lived a hobbit."
    );
    await reviewModal.submit();

    // 8. Navigate to Journey to verify it lives in Reflections & Bookshelf
    await library.clickNavTab("Journey");
    await expect(page).toHaveURL(/\/journey/);
    await expect(page.locator("body")).toContainText(/The Hobbit/i, { timeout: 8000 });
  });
});
