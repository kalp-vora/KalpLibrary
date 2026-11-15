import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object Model for Journey / Reflections, Multi-Level Bookshelf,
 * Cinema Ticket Stubs, and Chronological Timeline (/journey)
 */
export class JourneyPage extends BasePage {
  readonly pageTitle: Locator;
  readonly milestonesReachedCount: Locator;
  readonly booksReadCount: Locator;
  readonly screenTimeCount: Locator;
  readonly avgRatingCount: Locator;

  // Section Navigation Tabs
  readonly tabAll: Locator;
  readonly tabBooks: Locator;
  readonly tabMovies: Locator;
  readonly tabTimeline: Locator;

  // Section Headers
  readonly bookshelfSection: Locator;
  readonly cinemaSection: Locator;
  readonly timelineSection: Locator;

  // View Switchers
  readonly viewModeShelfBtn: Locator;
  readonly viewModeCardsBtn: Locator;
  readonly viewModeTicketsBtn: Locator;

  // Legacy / convenience aliases
  readonly filterAllBtn: Locator;
  readonly filterBooksBtn: Locator;
  readonly filterMoviesBtn: Locator;
  readonly bookSpines: Locator;
  readonly ticketStubs: Locator;
  readonly spineInspectionModal: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator("h1:has-text('Journey')");
    this.milestonesReachedCount = page.locator("div:has(> span:text-is('milestones reached'))").first();
    this.booksReadCount = page.locator("div:has(> span:text-is('Books Read'))").first();
    this.screenTimeCount = page.locator("div:has(> span:text-is('Screen Time'))").first();
    this.avgRatingCount = page.locator("div:has(> span:text-is('Avg Rating'))").first();

    this.tabAll = page.getByRole("button", { name: /all journey/i }).first();
    this.tabBooks = page.getByRole("button", { name: /bookshelf/i }).first();
    this.tabMovies = page.getByRole("button", { name: /cinema tickets/i }).first();
    this.tabTimeline = page.getByRole("button", { name: /timeline/i }).first();

    this.bookshelfSection = page.locator("h2:has-text('The Reading Room & Bookshelf')");
    this.cinemaSection = page.locator("h2:has-text('The Cinema Vault & Ticket Stubs')");
    this.timelineSection = page.locator("h2:has-text('Chronological Journey Timeline')");

    this.filterAllBtn = this.tabAll;
    this.filterBooksBtn = this.tabBooks;
    this.filterMoviesBtn = this.tabMovies;

    this.viewModeShelfBtn = page.getByRole("button", { name: /shelf/i }).first();
    this.viewModeCardsBtn = page.getByRole("button", { name: /grid|cards/i }).first();
    this.viewModeTicketsBtn = page.getByRole("button", { name: /ticket/i }).first();

    this.bookSpines = page.locator(".book-spine");
    this.ticketStubs = page.locator("text=Admit One");
    this.spineInspectionModal = page.locator(".fixed.inset-0.z-50");
  }

  async goto() {
    await this.navigateTo("/journey");
  }

  async switchSection(section: "all" | "books" | "movies" | "timeline") {
    if (section === "all") await this.tabAll.click();
    else if (section === "books") await this.tabBooks.click();
    else if (section === "movies") await this.tabMovies.click();
    else if (section === "timeline") await this.tabTimeline.click();
  }

  async switchViewMode(mode: "shelf" | "cards" | "grid") {
    if (mode === "shelf") {
      await this.viewModeShelfBtn.click();
    } else {
      await this.viewModeCardsBtn.click();
    }
  }
}
