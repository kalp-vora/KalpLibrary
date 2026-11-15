"use client";

import { useState, useEffect } from "react";
import { MediaType } from "@/types";
import { isRealOnlineCover } from "@/lib/bookCoverTheme";
import {
  getMovieCoverPalette,
  getMovieCoverTitleClass,
  getMovieCoverCreatorClass,
} from "@/lib/movieCoverTheme";

interface MovieCoverProps {
  title: string;
  creator: string;
  type?: MediaType;
  releaseYear?: number;
  runtimeMinutes?: number;
  posterUrl?: string | null;
  className?: string;
}

export const MovieCover: React.FC<MovieCoverProps> = ({
  title,
  creator,
  type = "movie",
  posterUrl,
  className = "",
}) => {
  const [hasImageError, setHasImageError] = useState(!isRealOnlineCover(posterUrl));

  useEffect(() => {
    setHasImageError(!isRealOnlineCover(posterUrl));
  }, [posterUrl]);

  // Priority 1: Real fetched original online movie poster (e.g. Cinemeta, Wikipedia, iTunes)
  if (!hasImageError && posterUrl && isRealOnlineCover(posterUrl)) {
    return (
      <img
        src={posterUrl}
        alt={title}
        onError={() => setHasImageError(true)}
        className={`w-full h-full object-cover object-center ${className}`}
      />
    );
  }

  // Priority 2: Custom cinema ticket placeholder (Only shown as fallback when original is not available)
  const palette = getMovieCoverPalette(title, creator, type);
  const displayTitle = title?.trim() || "Untitled Production";
  const displayCreator = creator?.trim() || "Director / Studio";

  const titleClass = getMovieCoverTitleClass(displayTitle);
  const creatorClass = getMovieCoverCreatorClass(displayCreator);

  return (
    <div
      style={{ backgroundColor: palette.color }}
      className={`relative w-full h-full overflow-hidden select-none flex flex-col justify-between rounded-md border border-white/10 shadow-lg transition-all ${className}`}
    >
      {/* Precise, pronounced cinema ticket punch notches */}
      <div className="absolute -left-3 sm:-left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-background border border-black/30 dark:border-white/15 shadow-inner pointer-events-none z-10" />
      <div className="absolute -right-3 sm:-right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-background border border-black/30 dark:border-white/15 shadow-inner pointer-events-none z-10" />

      {/* Subtle perforated ticket tear line connecting the side cuts */}
      <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 border-b border-dashed border-white/20 pointer-events-none z-0" />

      {/* 1. Top: Movie Title in Adaptive Classic Uppercase Serif Typography */}
      <div className="pt-4 sm:pt-6 px-3.5 sm:px-4 text-center flex flex-col items-center justify-start w-full">
        <h4
          style={{ color: palette.foilColor }}
          className={`font-serif font-semibold uppercase break-words w-full drop-shadow-sm ${titleClass}`}
        >
          {displayTitle}
        </h4>
      </div>

      {/* 2. Center: Pristine Plain Solid Negative Space */}
      <div className="flex-1 min-h-[16px]" />

      {/* 3. Bottom: Director / Studio in Spaced Uppercase Typography */}
      <div className="pb-4 sm:pb-5 px-3.5 sm:px-4 text-center flex flex-col items-center justify-end w-full">
        <p
          style={{ color: palette.foilColor }}
          className={`font-serif font-medium uppercase break-words w-full opacity-85 drop-shadow-sm ${creatorClass}`}
        >
          {displayCreator}
        </p>
      </div>
    </div>
  );
};
