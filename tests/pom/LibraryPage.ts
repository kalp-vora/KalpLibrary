import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Library Page (/library)
 */
export class LibraryPage extends BasePage {
  readonly searchInput: Locator;
  readonly suggestionsList: Locator;
  readonly clearSearchBtn: Locator;
  readonly searchSubmitBtn: Locator;
  readonly genreFilterButtons: Locator;
  readonly bookCards: Locator;
  readonly deskSpotlight: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByRole("textbox").first();
    this.suggestionsList = page.locator(".absolute.left-0.right-0, [role='listbox']");
    this.clearSearchBtn = page.getByRole("button", { name: /clear search/i });
    this.searchSubmitBtn = page.getByRole("button", { name: /^search$/i });
    this.genreFilterButtons = page.locator("button:has-text('All'), button:has-text('Sci-Fi'), button:has-text('Classics')");
    this.bookCards = page.locator(".group.relative.bg-surface-card");
    this.deskSpotlight = page.locator("div:has-text('Study Desk'), div:has-text('Reading Desk')").first();
  }

  async goto() {
    await this.navigateTo("/library");
  }

  async typeSearch(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.clearSearchBtn.click();
  }

  async submitSearch(query?: string) {
    if (query) {
      await this.typeSearch(query);
    }
    await this.searchInput.press("Enter");
  }

  async filterByGenre(genre: string) {
    const btn = this.page.getByRole("button", { name: new RegExp(`^${genre}`, "i") });
    await btn.click();
  }

  async openFirstBookDetail() {
    const firstCard = this.bookCards.first();
    await firstCard.click();
  }
}
