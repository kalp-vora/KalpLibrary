"use client";

import { useState, useEffect } from "react";
import {
  isRealOnlineCover,
  getBookCoverPalette,
  getBookCoverTitleClass,
  getBookCoverAuthorClass,
} from "@/lib/bookCoverTheme";

interface BookCoverProps {
  title: string;
  creator: string;
  pages?: number;
  releaseYear?: number;
  releaseDate?: string;
  posterUrl?: string | null;
  className?: string;
  customColor?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  creator,
  posterUrl,
  className = "",
  customColor,
}) => {
  const [hasImageError, setHasImageError] = useState(!isRealOnlineCover(posterUrl));

  useEffect(() => {
    setHasImageError(!isRealOnlineCover(posterUrl));
  }, [posterUrl]);

  // Priority 1: Real fetched online cover (e.g. Open Library, Google Books)
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

  // Priority 2: Custom physical hardcover book with plain solid color & gilded typography
  const palette = getBookCoverPalette(title, creator, customColor);
  const displayTitle = title?.trim() || "Untitled";
  const displayAuthor = creator?.trim() || "Anonymous";

  const titleClass = getBookCoverTitleClass(displayTitle);
  const authorClass = getBookCoverAuthorClass(displayAuthor);

  return (
    <div
      style={{ backgroundColor: palette.color }}
      className={`relative w-full h-full overflow-hidden select-none flex flex-col justify-between rounded-md border border-white/10 shadow-lg transition-all ${className}`}
    >
      {/* 1. Top Header: Book Title in Adaptive Classic Uppercase Serif Typography */}
      <div className="pt-4 sm:pt-6 px-3 sm:px-4 text-center flex flex-col items-center justify-start w-full">
        <h4
          style={{ color: palette.foilColor }}
          className={`font-serif font-semibold uppercase break-words w-full drop-shadow-sm ${titleClass}`}
        >
          {displayTitle}
        </h4>
      </div>

      {/* 2. Center: Pristine Plain Solid Negative Space */}
      <div className="flex-1 min-h-[16px]" />

      {/* 3. Bottom Footer: Author in Adaptive Spaced Uppercase Serif Typography */}
      <div className="pb-4 sm:pb-5 px-3 sm:px-4 text-center flex flex-col items-center justify-end w-full">
        <p
          style={{ color: palette.foilColor }}
          className={`font-serif font-medium uppercase break-words w-full opacity-85 drop-shadow-sm ${authorClass}`}
        >
          {displayAuthor}
        </p>
      </div>
    </div>
  );
};
