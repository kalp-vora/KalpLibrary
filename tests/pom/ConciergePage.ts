import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Concierge / Home Page (/)
 */
export class ConciergePage extends BasePage {
  readonly greetingHeader: Locator;
  readonly moodChips: Locator;
  readonly dailyQuoteCard: Locator;
  readonly copyQuoteButton: Locator;
  readonly bookPairingCard: Locator;
  readonly moviePairingCard: Locator;
  readonly addPairingToReadListBtn: Locator;
  readonly addPairingToWatchListBtn: Locator;
  readonly exploreStacksLink: Locator;
  readonly exploreTheaterLink: Locator;

  constructor(page: Page) {
    super(page);
    this.greetingHeader = page.locator("h1");
    this.moodChips = page.locator("button:has-text('Sci-Fi'), button:has-text('Philosophy'), button:has-text('Mystery'), button:has-text('Comedy')");
    this.dailyQuoteCard = page.locator(".quote-card, blockquote, [class*='border-brand-primary']").first();
    this.copyQuoteButton = page.getByRole("button", { name: /copy/i });
    this.bookPairingCard = page.locator("div:has-text('Recommended Reading')").first();
    this.moviePairingCard = page.locator("div:has-text('Recommended Screening')").first();
    this.addPairingToReadListBtn = page.getByRole("button", { name: /add to readlist|in readlist/i }).first();
    this.addPairingToWatchListBtn = page.getByRole("button", { name: /add to watchlist|in watchlist/i }).first();
    this.exploreStacksLink = page.getByRole("link", { name: /explore the stacks/i });
    this.exploreTheaterLink = page.getByRole("link", { name: /enter the theater/i });
  }

  async goto() {
    await this.navigateTo("/");
  }

  async selectMood(moodName: string) {
    const chip = this.page.getByRole("button", { name: new RegExp(moodName, "i") }).first();
    await chip.click();
  }

  async copyQuote() {
    await this.copyQuoteButton.click();
  }
}
