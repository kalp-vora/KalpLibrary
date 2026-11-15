"use client";

import { useState } from "react";
import { MediaItem, ItemStatus } from "@/types";
import { BookOpen, Bookmark, Clock, Calendar, CheckCircle2, Sparkles, ArrowRight, Library } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { getMediaConfig } from "@/lib/mediaConfig";
import { fireMajorCelebration } from "@/lib/celebrate";

interface ReadingDeskSpotlightProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onOpenReview: (item: MediaItem) => void;
  onStatusChange: (item: MediaItem, status: ItemStatus) => void;
}

export const ReadingDeskSpotlight: React.FC<ReadingDeskSpotlightProps> = ({
  items,
  onSelect,
  onOpenReview,
  onStatusChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no book is currently in progress, display a peaceful library desk banner
  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-theme-border p-4 sm:p-5 shadow-theme-card group">
        {/* Warm brass reading lamp illumination */}
        <div className="absolute top-0 right-1/4 left-1/4 h-24 cinema-marquee pointer-events-none animate-lamp-breath" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                  <span>Study Desk • Quiet Sanctuary</span>
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Your reading desk is clear. Select any volume from The Stacks below and click &ldquo;Read&rdquo; to place it on your desk.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-theme-border text-[11px] font-mono text-text-muted self-start sm:self-auto shrink-0 animate-float-gentle">
            <Library className="w-3.5 h-3.5 text-brand-primary" />
            <span>Circulation Open</span>
          </div>
        </div>
      </div>
    );
  }

  const activeItem = items[activeIndex] || items[0];
  const mediaConfig = getMediaConfig("book");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface-card border border-theme-border shadow-2xl transition-all duration-500 animate-fade-in-up">
      {/* Warm Atheneum Reading Lamp Glow */}
      <div className="absolute top-0 inset-x-0 h-40 cinema-marquee pointer-events-none animate-lamp-breath" />

      {/* Brass Desk Trim Accent */}
      <div className="h-1.5 w-full brass-plate border-b border-theme-border opacity-90" />

      <div className="p-5 sm:p-7 relative z-10 space-y-5">
        {/* Reading Room Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-border-subtle">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-primary font-bold flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 animate-pulse" />
              <span>On The Reading Desk • Active Study</span>
            </span>
          </div>

          {/* Multiple volumes switcher if more than 1 in progress */}
          {items.length > 1 && (
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-theme-border text-[11px] font-mono">
              <span className="text-text-subtle px-1.5 text-[10px]">Volumes:</span>
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-2.5 py-0.5 rounded transition-all ${
                    idx === activeIndex
                      ? "bg-brand-primary text-brand-primary-fg font-bold shadow-md scale-105"
                      : "text-text-muted hover:text-foreground"
                  }`}
                >
                  Vol. {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Volume Presentation */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Book Cover Frame on Desk with Shimmer Overlay */}
          <div
            onClick={() => onSelect(activeItem)}
            className="w-full sm:w-48 h-64 shrink-0 rounded-2xl overflow-hidden bg-surface border-2 border-theme-border cursor-pointer shadow-2xl group relative shimmer-overlay transition-all duration-300 hover:scale-105"
          >
            <BookCover
              title={activeItem.title}
              creator={activeItem.creator}
              pages={activeItem.lengthInfo?.pages}
              releaseYear={activeItem.releaseYear}
              posterUrl={activeItem.posterUrl}
              customColor={activeItem.spineStyle?.color}
              className="w-full h-full group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-200 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Open for Study</span>
              </span>
            </div>
          </div>

          {/* Volume Narrative & Controls */}
          <div className="flex-1 flex flex-col justify-between space-y-4 w-full">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/30 font-semibold animate-pulse-glow">
                  Cataloged Volume
                </span>
                <span className="text-xs text-text-subtle">•</span>
                <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-primary" />
                  {activeItem.releaseYear}
                </span>
                <span className="text-xs text-text-subtle">•</span>
                <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-primary" />
                  {mediaConfig.formatLength(activeItem.lengthInfo)}
                </span>
              </div>

              <h3
                onClick={() => onSelect(activeItem)}
                className="font-serif text-2xl sm:text-3xl font-bold text-foreground hover:text-brand-primary transition-colors cursor-pointer line-clamp-1"
              >
                {activeItem.title}
              </h3>

              <p className="text-sm text-brand-secondary font-medium">
                {mediaConfig.creatorPrefix}{activeItem.creator}
              </p>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeItem.genres?.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] px-2.5 py-0.5 rounded-md bg-surface border border-theme-border text-text-muted font-mono hover:border-brand-primary/40 transition-colors"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed pt-1">
                {activeItem.description || "A literary edition residing on your private reading desk for reflection."}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-theme-border-subtle">
              <button
                onClick={() => {
                  fireMajorCelebration();
                  onOpenReview(activeItem);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all active:scale-95 hover:shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Reading & Log Reflections</span>
              </button>

              <button
                onClick={() => onSelect(activeItem)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-surface hover:bg-surface-card text-foreground border border-theme-border transition-all shadow-sm active:scale-95 group"
              >
                <span>Examine Volume Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onStatusChange(activeItem, "to_experience")}
                className="text-[11px] text-text-subtle hover:text-brand-primary font-mono ml-auto hover:underline"
              >
                Return to The Stacks
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Brass Desk Trim Accent */}
      <div className="h-1.5 w-full brass-plate border-t border-theme-border opacity-90" />
    </div>
  );
};
