import { MediaItem } from "@/types";

export type MediaSortField = "dateAdded" | "rating" | "releaseYear" | "title";
export type BookshelfSortField = "date" | "rating" | "length" | "color";
export type SortOrder = "asc" | "desc";

export const MEDIA_SORT_STRATEGIES: Record<
  MediaSortField,
  (a: MediaItem, b: MediaItem) => number
> = {
  dateAdded: (a, b) =>
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
  rating: (a, b) =>
    (a.userRating || a.criticRating || 0) - (b.userRating || b.criticRating || 0),
  releaseYear: (a, b) =>
    (a.releaseYear || 0) - (b.releaseYear || 0),
  title: (a, b) =>
    a.title.localeCompare(b.title),
};

export const BOOKSHELF_SORT_STRATEGIES: Record<
  BookshelfSortField,
  (a: MediaItem, b: MediaItem) => number
> = {
  date: (a, b) => {
    const dateA = a.review?.finishedDate || a.updatedAt;
    const dateB = b.review?.finishedDate || b.updatedAt;
    return dateB.localeCompare(dateA);
  },
  rating: (a, b) => {
    const ratA = a.userRating || a.review?.rating || 0;
    const ratB = b.userRating || b.review?.rating || 0;
    return ratB - ratA;
  },
  length: (a, b) => {
    const lenA = a.lengthInfo?.pages || a.lengthInfo?.runtimeMinutes || 0;
    const lenB = b.lengthInfo?.pages || b.lengthInfo?.runtimeMinutes || 0;
    return lenB - lenA;
  },
  color: (a, b) => (a.spineStyle?.color || "").localeCompare(b.spineStyle?.color || ""),
};

export function sortMediaItems(
  items: MediaItem[],
  sortBy: MediaSortField,
  sortOrder: SortOrder = "desc"
): MediaItem[] {
  const comparator = MEDIA_SORT_STRATEGIES[sortBy] || MEDIA_SORT_STRATEGIES.dateAdded;
  return [...items].sort((a, b) => {
    const result = comparator(a, b);
    return sortOrder === "asc" ? result : -result;
  });
}

export function sortBookshelfItems(
  items: MediaItem[],
  sortBy: BookshelfSortField
): MediaItem[] {
  const comparator = BOOKSHELF_SORT_STRATEGIES[sortBy] || BOOKSHELF_SORT_STRATEGIES.date;
  return [...items].sort(comparator);
}
