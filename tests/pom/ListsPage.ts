import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Lists / Queue View (/lists)
 */
export class ListsPage extends BasePage {
  readonly searchFilterInput: Locator;
  readonly readListSection: Locator;
  readonly watchListSection: Locator;
  readonly queueCards: Locator;
  readonly exploreTheaterLink: Locator;
  readonly exploreLibraryLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchFilterInput = page.getByRole("textbox").first();
    this.readListSection = page.locator("section:has-text('ReadList')").first();
    this.watchListSection = page.locator("section:has-text('Watchlist')").first();
    this.queueCards = page.locator(".rounded-2xl.border.bg-surface-card");
    this.exploreLibraryLink = page.getByRole("button", { name: /find books/i });
    this.exploreTheaterLink = page.getByRole("button", { name: /find cinema/i });
  }

  async goto() {
    await this.navigateTo("/lists");
  }

  async searchInQueue(term: string) {
    await this.searchFilterInput.fill(term);
  }
}
