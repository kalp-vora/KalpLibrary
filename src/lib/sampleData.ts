import { MediaItem } from "@/types";

/**
 * Set of legacy sample item IDs to identify and purge any residual dummy data.
 */
export const SAMPLE_ITEM_IDS = new Set<string>([
  "book-1",
  "movie-1",
  "book-2",
  "tv-1",
  "book-3",
  "movie-2",
  "book-4",
  "movie-3",
]);

/**
 * Helper to identify whether an item is a legacy hardcoded sample/dummy item.
 */
export function isSampleItem(item: { id?: string }): boolean {
  if (!item?.id) return false;
  return SAMPLE_ITEM_IDS.has(item.id) || /^(book|movie|tv|anime)-[1-9]$/.test(item.id);
}

/**
 * Zero sample data. Entire application starts with a pristine, empty collection.
 */
export const INITIAL_ITEMS: MediaItem[] = [];
