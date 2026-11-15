/**
 * Utility functions for authentication session cookies and storage hygiene.
 */

export const AUTH_COOKIE_NAME = "kalp_auth";
export const TEST_AUTH_COOKIE_NAME = "kalp_test_auth";
export const AUTH_COOKIE_MAX_AGE = 2592000; // 30 days in seconds
export const LEGACY_STORAGE_USER_KEY = "kalp_library_user";

/**
 * Checks whether automated test authentication bypass is active.
 */
export function isTestAuthActive(): boolean {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_TEST_AUTH !== "true") {
    return false;
  }
  if (typeof document === "undefined") return false;
  const hasCookie = document.cookie.includes(`${TEST_AUTH_COOKIE_NAME}=1`);
  const hasStorage = typeof window !== "undefined" && window.localStorage?.getItem(TEST_AUTH_COOKIE_NAME) === "true";
  return hasCookie || hasStorage;
}

/**
 * Sets the authentication gate cookie for server proxy / middleware.
 */
export function setAuthSessionCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

/**
 * Clears the authentication gate cookie.
 */
export function clearAuthSessionCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

/**
 * Checks whether the client has an active authentication session cookie.
 */
export function hasAuthSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${AUTH_COOKIE_NAME}=1`);
}

/**
 * Purges any legacy plaintext user PII (email, name) from localStorage.
 */
export function purgeLegacyUserStorage(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LEGACY_STORAGE_USER_KEY);
    } catch {
      // Safe guard against restrictive browser privacy modes
    }
  }
}

/**
 * Establishes an active authenticated session and purges any insecure storage.
 */
export function establishAuthSession(): void {
  setAuthSessionCookie();
  purgeLegacyUserStorage();
}

/**
 * Terminates the authenticated session and clears stored session artifacts.
 */
export function terminateAuthSession(): void {
  clearAuthSessionCookie();
  purgeLegacyUserStorage();
}
