import { MediaItem } from "@/types";

/**
 * Normalizes a media title for robust deduplication and comparison.
 * Strips leading franchise tags ("Marvel's", "Disney's"), articles ("The", "A", "An"),
 * trailing year/format annotations ("(2012)", "[4K]", "(Film)"), and non-alphanumerics.
 */
export function normalizeMediaTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  let clean = rawTitle.toLowerCase().trim();
  clean = clean.replace(/^(marvel's|disney's|warner bros\.?)\s+/i, "");
  clean = clean.replace(/^(the|a|an)\s+/i, "");
  clean = clean.replace(/\s*\((?:18|19|20)\d{2}\)$/, "");
  clean = clean.replace(
    /\s*(\[(?:4k|hd|remastered|edition|collector's edition)\]|\((?:film|movie|novel|book|series|tv series)\))$/i,
    ""
  );
  return clean.replace(/[^a-z0-9]/g, "");
}

/**
 * Determines whether two items represent the same media entity.
 */
export function isSameMediaItem(
  a: { title: string; type?: string; releaseYear?: number },
  b: { title: string; type?: string; releaseYear?: number }
): boolean {
  if (!a?.title || !b?.title) return false;

  // Books and screen media with identical titles (e.g. "Dune" book vs "Dune" movie) are distinct
  if (a.type && b.type) {
    const isABook = a.type === "book";
    const isBBook = b.type === "book";
    if (isABook !== isBBook) return false;
  }

  const normA = normalizeMediaTitle(a.title);
  const normB = normalizeMediaTitle(b.title);
  if (!normA || !normB || normA !== normB) return false;

  // If both have explicit release years and differ by > 2 years (e.g. 1968 vs 2001 remakes), they are distinct
  if (a.releaseYear && b.releaseYear && Math.abs(a.releaseYear - b.releaseYear) > 2) {
    return false;
  }

  return true;
}

/**
 * Deduplicates candidate search results across multiple open online sources.
 * Merges metadata to keep authentic posters, creators, and runtime/page counts.
 */
export function deduplicateSearchResults<
  T extends {
    id: string;
    title: string;
    type?: string;
    releaseYear?: number;
    posterUrl?: string;
    creator?: string;
    description?: string;
    source?: string;
  }
>(candidates: T[]): T[] {
  const result: T[] = [];

  for (const item of candidates) {
    const existingIndex = result.findIndex((existing) => isSameMediaItem(existing, item));

    if (existingIndex === -1) {
      result.push({ ...item });
    } else {
      const existing = result[existingIndex];
      // Merge: upgrade poster if existing is placeholder/missing and incoming is authentic
      const incomingHasRealPoster =
        item.posterUrl &&
        item.posterUrl.startsWith("http") &&
        !item.posterUrl.includes("images.unsplash.com");
      const existingHasRealPoster =
        existing.posterUrl &&
        existing.posterUrl.startsWith("http") &&
        !existing.posterUrl.includes("images.unsplash.com");

      if (!existingHasRealPoster && incomingHasRealPoster) {
        existing.posterUrl = item.posterUrl;
      }

      // Upgrade creator if existing has generic placeholder
      const isPlaceholderCreator =
        !existing.creator ||
        existing.creator.includes("Acclaimed") ||
        existing.creator.includes("Unknown") ||
        existing.creator === "Director / Studio";
      if (isPlaceholderCreator && item.creator && !item.creator.includes("Acclaimed")) {
        existing.creator = item.creator;
      }

      // Keep longer, richer description
      if ((item.description?.length || 0) > (existing.description?.length || 0)) {
        existing.description = item.description;
      }

      // Combine sources if distinct
      if (item.source && existing.source && !existing.source.includes(item.source)) {
        existing.source = `${existing.source} / ${item.source}`;
      }
    }
  }

  return result;
}

/**
 * Deduplicates an array of MediaItems, ensuring no duplicate entries
 * for the same media title and type exist in Wishlist, Journey, or Library.
 */
export function deduplicateMediaItems(items: MediaItem[]): MediaItem[] {
  const seenMap = new Map<string, MediaItem>();

  for (const item of items) {
    const key = `${item.type}:${normalizeMediaTitle(item.title)}`;
    const existing = seenMap.get(key);
    if (!existing) {
      seenMap.set(key, item);
    } else {
      // Keep the one with newer updatedAt or richer user ratings
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      if (itemTime > existingTime || (item.userRating && !existing.userRating)) {
        seenMap.set(key, item);
      }
    }
  }

  return Array.from(seenMap.values());
}

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

