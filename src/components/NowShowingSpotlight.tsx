"use client";

import { useState } from "react";
import { MediaItem, ItemStatus } from "@/types";
import { Film, Clapperboard, Clock, Calendar, CheckCircle2, Projector, Sparkles, ArrowRight } from "lucide-react";
import { MovieCover } from "@/components/MovieCover";
import { getMediaConfig } from "@/lib/mediaConfig";
import { fireMajorCelebration } from "@/lib/celebrate";

interface NowShowingSpotlightProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onOpenReview: (item: MediaItem) => void;
  onStatusChange: (item: MediaItem, status: ItemStatus) => void;
}

export const NowShowingSpotlight: React.FC<NowShowingSpotlightProps> = ({
  items,
  onSelect,
  onOpenReview,
  onStatusChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no screen item is currently in progress, display a tasteful ambient cinema booth banner
  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-theme-border p-4 sm:p-5 shadow-theme-card group">
        {/* Subtle projector beam lighting */}
        <div className="absolute top-0 left-1/4 right-1/4 h-24 cinema-marquee pointer-events-none animate-projector-sweep" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Projector className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Screen 1 • Projector Idle</span>
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                The screening hall is clear. Pick any feature from your Watchlist below and click &ldquo;Watch&rdquo; to project it here.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-theme-border text-[11px] font-mono text-text-muted self-start sm:self-auto shrink-0 animate-float-gentle">
            <Film className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Admission Open</span>
          </div>
        </div>
      </div>
    );
  }

  const activeItem = items[activeIndex] || items[0];
  const mediaConfig = getMediaConfig(activeItem.type);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface-card border border-theme-border shadow-2xl transition-all duration-500 animate-fade-in-up">
      {/* Cinematic Marquee Top Ambient Beam */}
      <div className="absolute top-0 inset-x-0 h-40 cinema-marquee pointer-events-none animate-projector-sweep" />

      {/* Filmstrip Sprockets Top Accent */}
      <div className="h-2 w-full film-sprockets border-b border-theme-border opacity-70" />

      <div className="p-5 sm:p-7 relative z-10 space-y-5">
        {/* Screening Hall Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-border-subtle">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-secondary font-bold flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5 animate-pulse" />
              <span>Now Showing • Screen 1 Feature</span>
            </span>
          </div>

          {/* Multiple reels switcher if more than 1 in progress */}
          {items.length > 1 && (
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-theme-border text-[11px] font-mono">
              <span className="text-text-subtle px-1.5 text-[10px]">Reels:</span>
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-2.5 py-0.5 rounded transition-all ${idx === activeIndex
                      ? "bg-brand-primary text-brand-primary-fg font-bold shadow-md scale-105"
                      : "text-text-muted hover:text-foreground"
                    }`}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feature Presentation Spotlight */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Cinema Screen Frame for Poster */}
          <div
            onClick={() => onSelect(activeItem)}
            className="w-full sm:w-48 h-64 shrink-0 rounded-2xl overflow-hidden bg-surface border-2 border-theme-border cursor-pointer shadow-2xl group relative shimmer-overlay transition-all duration-300 hover:scale-105"
          >
            <MovieCover
              title={activeItem.title}
              creator={activeItem.creator}
              type={activeItem.type}
              releaseYear={activeItem.releaseYear}
              runtimeMinutes={activeItem.lengthInfo?.runtimeMinutes}
              posterUrl={activeItem.posterUrl}
              className="w-full h-full group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>On The Big Screen</span>
              </span>
            </div>
          </div>

          {/* Feature Narrative & Controls */}
          <div className="flex-1 flex flex-col justify-between space-y-4 w-full">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30 font-semibold animate-pulse-glow">
                  {mediaConfig.label}
                </span>
                <span className="text-xs text-text-subtle">•</span>
                <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-secondary" />
                  {activeItem.releaseYear}
                </span>
                <span className="text-xs text-text-subtle">•</span>
                <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-secondary" />
                  {mediaConfig.formatLength(activeItem.lengthInfo)}
                </span>
              </div>

              <h3
                onClick={() => onSelect(activeItem)}
                className="font-serif text-2xl sm:text-3xl font-bold text-foreground hover:text-brand-primary transition-colors cursor-pointer line-clamp-1 group"
              >
                <span>{activeItem.title}</span>
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
                {activeItem.description || "A feature presentation selected for your private screening room."}
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
                <span>Finish Screening & Review</span>
              </button>

              <button
                onClick={() => onSelect(activeItem)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-surface hover:bg-surface-card text-foreground border border-theme-border transition-all shadow-sm active:scale-95 group"
              >
                <span>Inspect Film Reel Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onStatusChange(activeItem, "to_experience")}
                className="text-[11px] text-text-subtle hover:text-brand-primary font-mono ml-auto hover:underline"
              >
                Move back to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filmstrip Sprockets Bottom Accent */}
      <div className="h-2 w-full film-sprockets border-t border-theme-border opacity-70" />
    </div>
  );
};
