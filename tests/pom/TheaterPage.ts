import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Theater Page (/theater)
 */
export class TheaterPage extends BasePage {
  readonly allScreenTab: Locator;
  readonly moviesTab: Locator;
  readonly tvSeriesTab: Locator;
  readonly animeTab: Locator;
  readonly searchInput: Locator;
  readonly nowShowingSpotlight: Locator;
  readonly screenMediaCards: Locator;

  constructor(page: Page) {
    super(page);
    this.allScreenTab = page.getByRole("button", { name: /all screen/i });
    this.moviesTab = page.getByRole("button", { name: /^movies/i });
    this.tvSeriesTab = page.getByRole("button", { name: /tv series/i });
    this.animeTab = page.getByRole("button", { name: /^anime/i });
    this.searchInput = page.getByRole("textbox").first();
    this.nowShowingSpotlight = page.locator("h2:has-text('Search Movie')");
    this.screenMediaCards = page.locator(".group.relative.bg-surface-card");
  }

  async goto() {
    await this.navigateTo("/theater");
  }

  async switchCategory(cat: "all" | "movies" | "tv" | "anime") {
    switch (cat) {
      case "all":
        await this.allScreenTab.click();
        break;
      case "movies":
        await this.moviesTab.click();
        break;
      case "tv":
        await this.tvSeriesTab.click();
        break;
      case "anime":
        await this.animeTab.click();
        break;
    }
  }

  async searchMovie(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
  }
}
