/**
 * Deterministic color palettes and typography utilities for solid-color
 * cinematic movie/theatre ticket placeholders matching the app's editorial aesthetic.
 */

import { MediaType } from "@/types";

export interface MovieCoverPalette {
  id: string;
  color: string;
  foilColor: string;
  border: string;
}

export const MOVIE_COVER_PALETTES: MovieCoverPalette[] = [
  {
    id: "midnight-noir",
    color: "#0F172A",
    foilColor: "#E2E8F0",
    border: "border-slate-700/50",
  },
  {
    id: "crimson-velvet",
    color: "#4A0E17",
    foilColor: "#FDE2E4",
    border: "border-[#7A1C29]/50",
  },
  {
    id: "golden-age",
    color: "#1E1A14",
    foilColor: "#F4DFC8",
    border: "border-[#42392E]/50",
  },
  {
    id: "emerald-cinema",
    color: "#0C1F17",
    foilColor: "#D1FAE5",
    border: "border-[#1C4736]/50",
  },
  {
    id: "deep-sapphire",
    color: "#0E1B2E",
    foilColor: "#E0F2FE",
    border: "border-[#1F3E6B]/50",
  },
  {
    id: "vintage-plum",
    color: "#2E102E",
    foilColor: "#F5E6F5",
    border: "border-[#5A245A]/50",
  },
  {
    id: "dark-espresso",
    color: "#241812",
    foilColor: "#FDF4E7",
    border: "border-[#4F3528]/50",
  },
  {
    id: "charcoal-screen",
    color: "#18181B",
    foilColor: "#F4F4F5",
    border: "border-[#3F3F46]/50",
  },
];

/**
 * Deterministically computes a movie cover palette based on the movie title, creator, and type.
 */
export function getMovieCoverPalette(
  title: string = "",
  creator: string = "",
  type: MediaType = "movie"
): MovieCoverPalette {
  const seed = `${type}_${title.trim().toLowerCase()}_${creator.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MOVIE_COVER_PALETTES.length;
  return MOVIE_COVER_PALETTES[index];
}

/**
 * Computes responsive typography classes for movie titles to adapt to long titles cleanly.
 */
export function getMovieCoverTitleClass(title: string = ""): string {
  const len = title.trim().length;
  if (len > 45) {
    return "text-[10px] sm:text-[11px] leading-tight tracking-wider line-clamp-4";
  }
  if (len > 28) {
    return "text-[11px] sm:text-xs leading-snug tracking-wider line-clamp-3";
  }
  if (len > 16) {
    return "text-xs sm:text-[13px] leading-snug tracking-widest line-clamp-3";
  }
  return "text-xs sm:text-sm lg:text-[15px] leading-snug tracking-widest line-clamp-3";
}

/**
 * Computes responsive typography classes for director/creator names.
 */
export function getMovieCoverCreatorClass(creator: string = ""): string {
  const len = creator.trim().length;
  if (len > 24) {
    return "text-[8px] sm:text-[9px] tracking-wider leading-tight line-clamp-2";
  }
  return "text-[9px] sm:text-[10px] tracking-widest leading-tight line-clamp-2";
}
