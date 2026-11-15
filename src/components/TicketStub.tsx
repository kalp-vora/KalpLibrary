"use client";

import React from "react";
import { MediaItem } from "@/types";
import { Star, Clock, Calendar, Quote, Sparkles } from "lucide-react";
import { formatCompletionDate } from "@/lib/timelineHelpers";

interface TicketStubProps {
  item: MediaItem;
  onClick?: () => void;
  className?: string;
}

export const TicketStub: React.FC<TicketStubProps> = ({ item, onClick, className = "" }) => {
  const displayTitle = item.title || "Untitled Motion Picture";
  const displayDirector = item.creator || "Director / Studio";
  const releaseYear = item.releaseYear || "Classic";
  const runtime = item.lengthInfo?.runtimeMinutes
    ? `${item.lengthInfo.runtimeMinutes} min`
    : item.type === "tv"
      ? "TV Series"
      : "Feature";
  const completedDate = formatCompletionDate(item.review?.finishedDate);
  const rating = item.userRating || item.review?.rating || 0;

  // Generate a deterministic serial code from id / title
  const serialSuffix = (item.id || "0000")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5)
    .toUpperCase() || "77492";
  const stubCode = `KL-${releaseYear}-${serialSuffix}`;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative flex flex-col sm:flex-row bg-[#18181b] text-zinc-100 rounded-2xl border border-amber-500/25 shadow-xl hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 overflow-hidden cursor-pointer select-none ${className}`}
    >
      {/* Vintage decorative header accent banner on left edge */}
      <div className="w-full sm:w-2 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 flex-shrink-0" />

      {/* Main Ticket Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between relative min-w-0">
        {/* Top Header Marquee */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Kalp Premiere &bull; Cinema Pass
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                {item.type === "tv" ? "TV Series" : "Cinema 1"}
              </span>
            </div>
          </div>

          {/* Title & Director */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors tracking-tight line-clamp-1">
            {displayTitle}
          </h3>
          <p className="text-xs text-amber-200/80 font-medium font-sans mt-0.5 line-clamp-1">
            Directed by {displayDirector} &bull; {releaseYear}
          </p>
        </div>

        {/* Reflection / Takeaways quote if present */}
        {item.review?.takeaways && (
          <div className="my-3 p-2.5 rounded-xl bg-black/40 border border-amber-500/15 text-xs italic text-zinc-300 flex items-start gap-2">
            <Quote className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed font-serif">
              &ldquo;{item.review.takeaways}&rdquo;
            </p>
          </div>
        )}

        {/* Bottom Details Row */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-white/10 text-xs">
          {/* Runtime & Completion Date */}
          <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400/80" />
              {runtime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400/80" />
              {completedDate}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-700 fill-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Perforation Line with Semicircle Notches */}
      <div className="relative flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-dashed border-amber-500/30 px-3 py-2 sm:px-0 sm:py-0">
        {/* Top Notch (Desktop) / Left Notch (Mobile) */}
        <div className="hidden sm:block absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-card border border-amber-500/35 shadow-inner" />
        {/* Bottom Notch (Desktop) / Right Notch (Mobile) */}
        <div className="hidden sm:block absolute -bottom-3.5 sm:-bottom-4 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-card border border-amber-500/35 shadow-inner" />
      </div>

      {/* Right Ticket Stub (Tear-off portion) */}
      <div className="w-full sm:w-36 bg-[#121214] p-4 sm:p-5 flex flex-row sm:flex-col items-center justify-between text-center border-t sm:border-t-0 border-white/5 relative">
        <div className="flex flex-col items-start sm:items-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
            Admit One
          </span>
          <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
            {stubCode}
          </span>
        </div>

        {/* Barcode Strip */}
        <div className="flex flex-col items-center justify-center my-1 sm:my-2">
          <div className="flex items-center gap-[2px] h-9 px-2 bg-white/95 rounded p-1 shadow-inner">
            {/* Visual barcode stripes */}
            {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3].map((width, i) => (
              <div
                key={i}
                style={{ width: `${width}px` }}
                className="h-full bg-black flex-shrink-0"
              />
            ))}
          </div>
          <span className="text-[9px] font-mono tracking-widest text-zinc-400 mt-1 uppercase">
            Auditorium Pass
          </span>
        </div>

        <div className="text-[9px] font-mono text-zinc-500 uppercase">
          Keep Stub
        </div>
      </div>
    </div>
  );
};
