import { MediaItem } from "@/types";

/**
 * Calculates total pages read across books.
 */
export function computePagesRead(books: MediaItem[]): number {
  return books
    .filter((b) => b.type === "book")
    .reduce((sum, b) => sum + (b.lengthInfo?.pages || 0), 0);
}

/**
 * Calculates total viewing hours from finished movies / shows.
 */
export function computeWatchHours(items: MediaItem[]): number {
  const totalMinutes = items
    .filter((i) => i.type !== "book")
    .reduce((sum, m) => sum + (m.lengthInfo?.runtimeMinutes || 0), 0);
  return Math.round(totalMinutes / 60);
}

/**
 * Computes average user rating formatted to 1 decimal place.
 */
export function computeAverageRating(items: MediaItem[]): string {
  const rated = items.filter((i) => i.userRating || i.review?.rating);
  if (rated.length === 0) return "—";
  const sum = rated.reduce((acc, i) => acc + (i.userRating || i.review?.rating || 0), 0);
  return (sum / rated.length).toFixed(1);
}

/**
 * Computes categorized item counts for books, cinema/series, and rated items.
 */
export function computeItemCounts(items: MediaItem[]): {
  books: number;
  screen: number;
  rated: number;
} {
  const books = items.filter((i) => i.type === "book").length;
  const screen = items.filter((i) => i.type !== "book").length;
  const rated = items.filter((i) => i.userRating || i.review?.rating).length;
  return { books, screen, rated };
}

/**
 * Chunks a list of media items into continuous shelf segments.
 */
export function chunkIntoShelves(items: MediaItem[], shelfCapacity: number = 10): MediaItem[][] {
  const shelves: MediaItem[][] = [];
  for (let i = 0; i < items.length; i += shelfCapacity) {
    shelves.push(items.slice(i, i + shelfCapacity));
  }
  return shelves.length > 0 ? shelves : [[]];
}

/**
 * Computes a frequency-ranked genre breakdown for a given set of items.
 */
export function computeGenreBreakdown(
  items: MediaItem[],
  filterPredicate?: (item: MediaItem) => boolean
): Array<{ genre: string; count: number }> {
  const targetItems = filterPredicate ? items.filter(filterPredicate) : items;
  const genreMap: Record<string, number> = {};

  targetItems.forEach((item) => {
    item.genres?.forEach((genre) => {
      genreMap[genre] = (genreMap[genre] || 0) + 1;
    });
  });

  return Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count }));
}
