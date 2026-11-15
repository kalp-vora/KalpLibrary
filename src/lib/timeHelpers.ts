/**
 * Time and date helper utilities.
 */

export interface TimeGreetingRange {
  maxHour: number;
  greeting: "morning" | "afternoon" | "evening" | "night";
}

export const TIME_GREETING_RANGES: TimeGreetingRange[] = [
  { maxHour: 12, greeting: "morning" },
  { maxHour: 17, greeting: "afternoon" },
  { maxHour: 22, greeting: "evening" },
  { maxHour: 24, greeting: "night" },
];

/**
 * Resolves the appropriate conversational greeting based on hour of day (0-23).
 */
export function getTimeGreeting(hour: number = new Date().getHours()): string {
  const matched = TIME_GREETING_RANGES.find((range) => hour < range.maxHour);
  return matched?.greeting || "day";
}

/**
 * Returns the 1-based day of the year (1 - 365/366) for progressive rotation.
 */
export function getDayOfYear(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
