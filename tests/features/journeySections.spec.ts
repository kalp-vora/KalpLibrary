import { test, expect } from "@playwright/test";
import { JourneyPage } from "../pom/JourneyPage";

test.describe("Feature Tests - Journey Sections, Bookshelf Levels, Cinema Tickets & Timeline", () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock completed book and movie data into localStorage
    await page.addInitScript(() => {
      const mockItems = [
        {
          id: "user-finished-book-dune",
          type: "book",
          title: "Dune",
          creator: "Frank Herbert",
          releaseYear: 1965,
          createdAt: "2024-11-10T12:00:00Z",
          updatedAt: "2024-11-10T14:00:00Z",
          moodTags: [],
          themes: [],
          genres: ["Sci-Fi"],
          description: "Desert epic",
          posterUrl: "",
          status: "finished",
          lengthInfo: { pages: 412 },
          userRating: 5,
          spineStyle: {
            color: "#8B4513",
            textColor: "light",
            accentColor: "#F59E0B",
            thicknessPx: 44,
            heightPercent: 96
          },
          review: {
            rating: 5,
            finishedDate: "Nov 10, 2024",
            takeaways: "Fear is the mind-killer.",
            thoughts: "A masterpiece of political intrigue and desert ecology.",
            favoriteQuote: "I must not fear."
          }
        },
        {
          id: "user-finished-movie-3idiots",
          type: "movie",
          title: "3 Idiots",
          creator: "Rajkumar Hirani",
          releaseYear: 2009,
          createdAt: "2024-11-12T12:00:00Z",
          updatedAt: "2024-11-12T14:00:00Z",
          moodTags: [],
          themes: [],
          genres: ["Comedy", "Drama"],
          description: "Bollywood classic",
          posterUrl: "",
          status: "finished",
          lengthInfo: { runtimeMinutes: 170 },
          userRating: 5,
          review: {
            rating: 5,
            finishedDate: "Nov 12, 2024",
            takeaways: "Pursue excellence, and success will follow.",
            thoughts: "Remarkable blend of comedy and educational philosophy.",
            favoriteQuote: "All is well!"
          }
        }
      ];
      localStorage.setItem("kalp_library_items_v1", JSON.stringify(mockItems));
    });
  });

  test("Journey page displays stats, multi-level Bookshelf, Cinema Ticket Stubs, and Timeline", async ({
    page
  }) => {
    const journey = new JourneyPage(page);
    await journey.goto();

    // 1. Verify Header & Metrics are present and accurate
    await expect(journey.pageTitle).toBeVisible();
    await expect(journey.milestonesReachedCount).toContainText("2");
    await expect(journey.booksReadCount).toContainText("1");
    await expect(journey.booksReadCount).toContainText("412 pages");
    await expect(journey.screenTimeCount).toContainText("1");
    await expect(journey.screenTimeCount).toContainText("3 hrs");
    await expect(journey.avgRatingCount).toContainText("5.0");

    // 2. Section 1: Bookshelf & Shelf Levels
    await expect(journey.bookshelfSection).toBeVisible();
    await expect(page.locator("text=Shelf Level 1")).toBeVisible();
    await expect(page.locator(".book-spine")).toBeVisible();
    await expect(page.locator(".book-spine")).toContainText(/Dune/i);

    // Toggle Books section to Simple Grid
    const booksSection = page.locator("section:has-text('The Reading Room & Bookshelf')");
    const booksGridBtn = booksSection.getByRole("button", { name: /simple grid/i });
    await booksGridBtn.click();
    await expect(booksSection.locator("text=412 pages")).toBeVisible();

    // 3. Section 2: Cinema Vault & Ticket Stubs
    await expect(journey.cinemaSection).toBeVisible();
    await expect(page.locator("text=Kalp Premiere • Cinema Pass").first()).toBeVisible();
    await expect(page.locator("text=3 Idiots").first()).toBeVisible();
    await expect(page.locator("text=Admit One").first()).toBeVisible();

    // Toggle Cinema section to Simple Grid
    const cinemaSection = page.locator("section:has-text('The Cinema Vault & Ticket Stubs')");
    const cinemaGridBtn = cinemaSection.getByRole("button", { name: /simple grid/i });
    await cinemaGridBtn.click();
    await expect(cinemaSection.locator("text=170 min")).toBeVisible();

    // 4. Section 3: Chronological Journey Timeline
    const timelineSection = page.locator("section:has-text('Chronological Journey Timeline')");
    await expect(timelineSection).toBeVisible();
    await expect(timelineSection.locator("text=Nov 12, 2024")).toBeVisible();
    await expect(timelineSection.locator("text=Nov 10, 2024")).toBeVisible();
    await expect(timelineSection.locator("text=Fear is the mind-killer.")).toBeVisible();

    // 5. Test Section Filtering Tabs
    await journey.switchSection("books");
    await expect(journey.bookshelfSection).toBeVisible();
    await expect(journey.cinemaSection).not.toBeVisible();
    await expect(journey.timelineSection).not.toBeVisible();

    await journey.switchSection("movies");
    await expect(journey.cinemaSection).toBeVisible();
    await expect(journey.bookshelfSection).not.toBeVisible();

    await journey.switchSection("timeline");
    await expect(journey.timelineSection).toBeVisible();
    await expect(journey.bookshelfSection).not.toBeVisible();
  });
});
