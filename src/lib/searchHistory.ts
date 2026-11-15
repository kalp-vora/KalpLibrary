/**
 * Dedicated utility module for tracking, persisting, and analyzing user search history.
 * Adheres to AGENTS.md separation-of-concerns and security directives.
 */

import { MediaType } from "@/types";
import { getFirebaseInstance, isFirebaseConfigured } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export interface SearchInteraction {
  id: string;
  query: string;
  type: MediaType;
  timestamp: string;
  clickedTitle?: string;
  genres?: string[];
  creator?: string;
}

export interface UserSearchAffinity {
  topQueries: string[];
  genreWeights: Record<string, number>;
  creatorWeights: Record<string, number>;
  totalSearches: number;
}

const SEARCH_HISTORY_STORAGE_KEY = "kalp_search_history_v1";
const MAX_HISTORY_ENTRIES = 50;

/**
 * Reads search history from localStorage.
 */
export function getSearchHistory(): SearchInteraction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load search history:", err);
    return [];
  }
}

/**
 * Records a search query and optional interaction metadata to LocalStorage & Firestore.
 */
export function recordSearch(
  query: string,
  type: MediaType = "movie",
  meta?: { clickedTitle?: string; genres?: string[]; creator?: string }
): void {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;

  const now = new Date().toISOString();
  const interactionId = `search-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const interaction: SearchInteraction = {
    id: interactionId,
    query: trimmed,
    type,
    timestamp: now,
    clickedTitle: meta?.clickedTitle,
    genres: meta?.genres,
    creator: meta?.creator,
  };

  // 1. Persist to LocalStorage
  if (typeof window !== "undefined") {
    try {
      const current = getSearchHistory();
      // Deduplicate recent same query within 5 minutes
      const filtered = current.filter((item) => {
        const isSame = item.query.toLowerCase() === trimmed.toLowerCase() && item.type === type;
        if (!isSame) return true;
        const diffMs = Date.now() - new Date(item.timestamp).getTime();
        return diffMs > 5 * 60 * 1000;
      });

      const next = [interaction, ...filtered].slice(0, MAX_HISTORY_ENTRIES);
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn("Failed to save search history locally:", err);
    }
  }

  // 2. Persist to Cloud Firestore if user is authenticated
  if (typeof window !== "undefined" && isFirebaseConfigured()) {
    try {
      const { auth, db } = getFirebaseInstance();
      const user = auth?.currentUser;
      if (user && db) {
        const historyDocRef = doc(db, "users", user.uid, "search_history", interactionId);
        setDoc(historyDocRef, interaction, { merge: true }).catch((err) =>
          console.warn("Firestore search history sync warning:", err)
        );
      }
    } catch {
      // offline fallback
    }
  }
}

/**
 * Computes the user's search affinity profile (preferred genres, creators, and frequent queries).
 */
export function getUserSearchAffinity(): UserSearchAffinity {
  const history = getSearchHistory();
  const queryCounts: Record<string, number> = {};
  const genreWeights: Record<string, number> = {};
  const creatorWeights: Record<string, number> = {};

  for (const entry of history) {
    const qLower = entry.query.toLowerCase();
    queryCounts[qLower] = (queryCounts[qLower] || 0) + 1;

    // Weight genres higher if user actually clicked or added an item from that search
    const genreBoost = entry.clickedTitle ? 3 : 1;
    if (Array.isArray(entry.genres)) {
      for (const g of entry.genres) {
        genreWeights[g] = (genreWeights[g] || 0) + genreBoost;
      }
    }

    if (entry.creator) {
      const creatorBoost = entry.clickedTitle ? 3 : 1;
      creatorWeights[entry.creator.toLowerCase()] =
        (creatorWeights[entry.creator.toLowerCase()] || 0) + creatorBoost;
    }
  }

  const topQueries = Object.entries(queryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([q]) => q);

  return {
    topQueries,
    genreWeights,
    creatorWeights,
    totalSearches: history.length,
  };
}

/**
 * Retrieves recent search queries for auto-completion and suggestion lists.
 */
export function getRecentSearchQueries(type?: MediaType, limit: number = 6): string[] {
  const history = getSearchHistory();
  const seen = new Set<string>();
  const results: string[] = [];

  for (const item of history) {
    if (type && item.type !== type) continue;
    const norm = item.query.trim();
    const lower = norm.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      results.push(norm);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Clears search history.
 */
export function clearSearchHistory(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
