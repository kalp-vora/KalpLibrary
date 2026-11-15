import { MediaItem } from "@/types";

export interface TimelineEntry {
  item: MediaItem;
  dateKey: string;
  formattedDate: string;
  timestamp: number;
}

export interface TimelineGroup {
  periodLabel: string;
  entries: TimelineEntry[];
}

/**
 * Formats a raw date string or timestamp into a readable date for display.
 */
export function formatCompletionDate(rawDate?: string | null): string {
  if (!rawDate) return "Recently Completed";

  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) {
    // If it's already a clean string like "Nov 14, 2024", return it directly
    return rawDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

/**
 * Extracts a sortable timestamp from a media item's completion or update date.
 */
export function getItemCompletionTimestamp(item: MediaItem): number {
  if (item.review?.finishedDate) {
    const time = new Date(item.review.finishedDate).getTime();
    if (!isNaN(time)) return time;
  }
  if (item.updatedAt) {
    const time = new Date(item.updatedAt).getTime();
    if (!isNaN(time)) return time;
  }
  if (item.createdAt) {
    const time = new Date(item.createdAt).getTime();
    if (!isNaN(time)) return time;
  }
  return 0;
}

/**
 * Prepares and sorts completed items into chronological or reverse chronological timeline entries.
 */
export function buildTimelineEntries(
  items: MediaItem[],
  order: "desc" | "asc" = "desc"
): TimelineEntry[] {
  const finishedItems = items.filter((item) => item.status === "finished");

  const entries: TimelineEntry[] = finishedItems.map((item) => {
    const timestamp = getItemCompletionTimestamp(item);
    const formattedDate = formatCompletionDate(item.review?.finishedDate);
    const dateKey = item.review?.finishedDate || "Earlier";

    return {
      item,
      dateKey,
      formattedDate,
      timestamp
    };
  });

  return entries.sort((a, b) => {
    if (order === "desc") {
      return b.timestamp - a.timestamp;
    }
    return a.timestamp - b.timestamp;
  });
}

/**
 * Groups timeline entries by Month & Year for structured progression.
 */
export function groupTimelineByPeriod(entries: TimelineEntry[]): TimelineGroup[] {
  const groupsMap = new Map<string, TimelineEntry[]>();

  entries.forEach((entry) => {
    let period = "Recent Milestones";
    if (entry.timestamp > 0) {
      const d = new Date(entry.timestamp);
      period = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric"
      }).format(d);
    }

    const currentList = groupsMap.get(period) || [];
    currentList.push(entry);
    groupsMap.set(period, currentList);
  });

  const result: TimelineGroup[] = [];
  groupsMap.forEach((groupEntries, periodLabel) => {
    result.push({ periodLabel, entries: groupEntries });
  });

  return result;
}
