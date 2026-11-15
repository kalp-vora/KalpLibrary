/**
 * Search Relevance & Precision Ranking Engine.
 * Implements strict exact-match precedence, token coverage, conciseness ratio,
 * and personalized user search affinity weighting.
 */

import type { SearchResultItem } from "./onlineResources";
import { UserSearchAffinity, getUserSearchAffinity } from "./searchHistory";

/**
 * Normalizes text for comparison by stripping punctuation and non-alphanumeric chars.
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Computes a relevance score for a search result against a user query and user affinity.
 */
export function computeRelevanceScore(
  item: SearchResultItem,
  rawQuery: string,
  affinity?: UserSearchAffinity
): number {
  const query = rawQuery.trim().toLowerCase();
  const title = (item.title || "").trim().toLowerCase();
  const creator = (item.creator || "").trim().toLowerCase();

  const normQuery = normalizeText(query);
  const normTitle = normalizeText(title);

  if (!normQuery) return 0;

  let score = 0;

  // 1. Exact Match Dominance (+10,000 pts)
  // Ensures exact matches like "3 Idiots" -> "3 Idiots" are always #1
  if (normTitle === normQuery) {
    score += 10000;
  } else if (title === query) {
    score += 8500;
  }

  // 2. Exact Title Prefix (+4,000 pts)
  if (normTitle.startsWith(normQuery)) {
    score += 4000;
  }

  // 3. Word Token Precision & Coverage
  const queryTokens = query.split(/\s+/).filter((w) => w.length > 0);
  const titleTokens = title.split(/\s+/).filter((w) => w.length > 0);

  if (queryTokens.length > 0) {
    let matchedTokenCount = 0;
    for (const qToken of queryTokens) {
      if (titleTokens.some((t) => t.includes(qToken) || qToken.includes(t))) {
        matchedTokenCount++;
      }
    }

    const tokenCoverage = matchedTokenCount / queryTokens.length;
    score += tokenCoverage * 2500;

    // All query tokens present in title (+1,500 pts)
    if (tokenCoverage === 1) {
      score += 1500;
    }
  }

  // 4. Conciseness Ratio (penalize bloated titles where query is just a substring)
  // "3 Idiots" has ratio 1.0; "3 Idiots in a Strange Adventure" has ratio 0.4
  const concisenessRatio = Math.min(1, normQuery.length / Math.max(1, normTitle.length));
  score += concisenessRatio * 1200;

  // 5. Creator / Director Match (+1,500 pts)
  if (creator) {
    if (query.includes(creator) || creator.includes(query)) {
      score += 1500;
    } else {
      for (const qToken of queryTokens) {
        if (qToken.length > 2 && creator.includes(qToken)) {
          score += 400;
        }
      }
    }
  }

  // 6. Quality & Rating Baseline
  if (item.criticRating) {
    score += item.criticRating * 40;
  }

  // 7. User Search Affinity & Personalization Boost
  if (affinity) {
    // Genre affinity
    if (Array.isArray(item.genres)) {
      for (const g of item.genres) {
        const weight = affinity.genreWeights[g] || 0;
        if (weight > 0) {
          score += Math.min(weight * 60, 400);
        }
      }
    }

    // Creator affinity
    if (creator && affinity.creatorWeights[creator]) {
      score += Math.min(affinity.creatorWeights[creator] * 120, 600);
    }
  }

  return score;
}

/**
 * Sorts and ranks search candidate items by relevance score descending.
 */
export function rankSearchResults(
  candidates: SearchResultItem[],
  query: string,
  affinity?: UserSearchAffinity
): SearchResultItem[] {
  const userAffinity = affinity || (typeof window !== "undefined" ? getUserSearchAffinity() : undefined);

  // Compute scores and attach
  const scored = candidates.map((item) => ({
    item,
    score: computeRelevanceScore(item, query, userAffinity),
  }));

  // Sort descending by score, tie-breaking by rating and year
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const ratingB = b.item.criticRating || 0;
    const ratingA = a.item.criticRating || 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return (b.item.releaseYear || 0) - (a.item.releaseYear || 0);
  });

  return scored.map((s) => s.item);
}
