import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Detail Modal & Review Modal
 */
export class DetailModalPom {
  readonly page: Page;
  readonly modal: Locator;
  readonly closeBtn: Locator;
  readonly titleHeader: Locator;
  readonly statusQueueBtn: Locator;
  readonly statusActiveBtn: Locator;
  readonly statusDoneBtn: Locator;
  readonly writeThoughtsBtn: Locator;
  readonly deleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator(".fixed.inset-0.z-50");
    this.closeBtn = this.modal.getByRole("button", { name: /close/i });
    this.titleHeader = this.modal.locator("h1");
    this.statusQueueBtn = this.modal.getByRole("button", { name: /^queue$/i });
    this.statusActiveBtn = this.modal.getByRole("button", { name: /^active$/i });
    this.statusDoneBtn = this.modal.getByRole("button", { name: /^done$/i });
    this.writeThoughtsBtn = this.modal.getByRole("button", { name: /completion thoughts|edit thoughts/i });
    this.deleteBtn = this.modal.getByRole("button", { name: /delete/i });
  }

  async close() {
    await this.closeBtn.click();
  }

  async setStatus(status: "queue" | "active" | "done") {
    if (status === "queue") await this.statusQueueBtn.click();
    if (status === "active") await this.statusActiveBtn.click();
    if (status === "done") await this.statusDoneBtn.click();
  }

  async openReview() {
    await this.writeThoughtsBtn.click();
  }
}

export class ReviewModalPom {
  readonly page: Page;
  readonly modal: Locator;
  readonly closeBtn: Locator;
  readonly titleHeader: Locator;
  readonly ratingStars: Locator;
  readonly takeawaysInput: Locator;
  readonly thoughtsInput: Locator;
  readonly favoriteQuoteInput: Locator;
  readonly recommendToInput: Locator;
  readonly saveReviewBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator(".fixed.inset-0.z-50:has-text('You Finished')");
    this.closeBtn = this.modal.getByRole("button", { name: /close/i });
    this.titleHeader = this.modal.locator("h2");
    this.ratingStars = this.modal.locator("button:has(.lucide-star)");
    this.takeawaysInput = this.modal.locator("textarea[placeholder*='takeaway' i], textarea").first();
    this.thoughtsInput = this.modal.locator("textarea[placeholder*='thought' i], textarea").last();
    this.favoriteQuoteInput = this.modal.locator("input[placeholder*='memorable' i]");
    this.recommendToInput = this.modal.locator("input[placeholder*='recommend' i]");
    this.saveReviewBtn = this.modal.getByRole("button", { name: /save & (place on shelf|add ticket to vault)/i });
  }

  async setRating(rating: number) {
    const star = this.ratingStars.nth(Math.max(0, Math.min(4, rating - 1)));
    await star.click();
  }

  async fillReview(takeaways: string, thoughts: string, quote?: string) {
    await this.takeawaysInput.fill(takeaways);
    await this.thoughtsInput.fill(thoughts);
    if (quote) {
      await this.favoriteQuoteInput.fill(quote);
    }
  }

  async submit() {
    await this.saveReviewBtn.click();
  }
}
