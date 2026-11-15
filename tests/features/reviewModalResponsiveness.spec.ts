import { test, expect, Page } from "@playwright/test";
import { LibraryPage } from "../pom/LibraryPage";
import { ReviewModalPom } from "../pom/ModalsPom";

async function addSampleItemAndOpenReview(page: Page, isMobile = false): Promise<ReviewModalPom> {
  const library = new LibraryPage(page);
  await library.goto();

  // Search online book
  await library.typeSearch("The Hobbit");
  await library.searchSubmitBtn.click();

  // Add to queue
  const addBtn = page.getByRole("button", { name: "+ Add to ReadList" }).first();
  await expect(addBtn).toBeVisible({ timeout: 10000 });
  await addBtn.click();

  // Navigate to lists
  if (isMobile) {
    await page.goto("/lists");
  } else {
    await library.clickNavTab("Lists");
  }
  await expect(page).toHaveURL(/\/lists/);
  await expect(page.locator("body")).toContainText(/The Hobbit/i, { timeout: 8000 });

  // Click "Mark Read" to trigger ReviewModal
  const markReadBtn = page.getByRole("button", { name: /Mark Read/i }).first();
  await expect(markReadBtn).toBeVisible({ timeout: 5000 });
  await markReadBtn.click();

  const reviewModal = new ReviewModalPom(page);
  await expect(reviewModal.modal).toBeVisible({ timeout: 5000 });
  return reviewModal;
}

test.describe("Feature Tests - ReviewModal Responsiveness, Dismissal & Scroll Lock", () => {
  test("ReviewModal locks background scroll when open, dismisses with Escape key", async ({ page }) => {
    const reviewModal = await addSampleItemAndOpenReview(page);

    // 1. Verify body scroll is locked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe("hidden");

    // 2. Press Escape key to dismiss
    await page.keyboard.press("Escape");
    await expect(reviewModal.modal).not.toBeVisible({ timeout: 5000 });

    // 3. Verify body scroll lock is restored
    const restoredBodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(restoredBodyOverflow).not.toBe("hidden");
  });

  test("ReviewModal dismisses when clicking backdrop outside the modal dialog", async ({ page }) => {
    const reviewModal = await addSampleItemAndOpenReview(page);

    // Click backdrop (near top-left corner outside modal card)
    await reviewModal.modal.click({ position: { x: 10, y: 10 } });
    await expect(reviewModal.modal).not.toBeVisible({ timeout: 5000 });
  });

  test("ReviewModal on mobile viewport has visible close button and fits within viewport", async ({ page }) => {
    // Set mobile viewport (iPhone SE size 375x667)
    await page.setViewportSize({ width: 375, height: 667 });

    const reviewModal = await addSampleItemAndOpenReview(page, true);

    // Verify close button is visible on mobile
    const closeBtn = reviewModal.modal.getByRole("button", { name: /close/i });
    await expect(closeBtn).toBeVisible();

    // Verify close button bounding box is well within the 375px viewport
    const closeBox = await closeBtn.boundingBox();
    expect(closeBox).not.toBeNull();
    if (closeBox) {
      expect(closeBox.x).toBeGreaterThan(0);
      expect(closeBox.x + closeBox.width).toBeLessThanOrEqual(375);
      expect(closeBox.y).toBeGreaterThanOrEqual(0);
      expect(closeBox.y).toBeLessThan(667);
    }

    // Click close button to dismiss
    await closeBtn.click();
    await expect(reviewModal.modal).not.toBeVisible({ timeout: 5000 });
  });

  test("ReviewModal on laptop viewport does not take up the full screen", async ({ page }) => {
    // Set typical laptop viewport (1366x768)
    await page.setViewportSize({ width: 1366, height: 768 });

    const reviewModal = await addSampleItemAndOpenReview(page);

    // The inner modal dialog form
    const modalForm = reviewModal.modal.locator("form");
    const box = await modalForm.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Width should be constrained (max-w-xl is 576px, definitely not full 1366px screen)
      expect(box.width).toBeLessThan(650);
      // Height should not fill the entire 768px height (leaves margin above and below)
      expect(box.height).toBeLessThan(750);
      // There must be visible backdrop margin on left, right, top and bottom
      expect(box.x).toBeGreaterThan(100);
      expect(box.y).toBeGreaterThan(10);
    }
  });
});
