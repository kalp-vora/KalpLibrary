import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any fast-changing value (e.g. search query keystrokes).
 * Default delay is 500ms as per project engineering standards.
 *
 * @param value The value to debounce.
 * @param delayMs The debounce interval in milliseconds (defaults to 500ms).
 */
export function useDebounce<T>(value: T, delayMs: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
