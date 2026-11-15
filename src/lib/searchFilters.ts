import { MediaItem } from "@/types";

/**
 * Checks whether a MediaItem matches a text query across title, creator, genres, and description.
 */
export function matchesMediaSearch(item: MediaItem, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const matchTitle = item.title.toLowerCase().includes(query);
  const matchCreator = item.creator.toLowerCase().includes(query);
  const matchGenre = item.genres?.some((g) => g.toLowerCase().includes(query));
  const matchDesc = item.description?.toLowerCase().includes(query);

  return Boolean(matchTitle || matchCreator || matchGenre || matchDesc);
}

/**
 * Filters a list of MediaItems by search query.
 */
export function filterMediaBySearch(items: MediaItem[], query: string): MediaItem[] {
  if (!query.trim()) return items;
  return items.filter((item) => matchesMediaSearch(item, query));
}
