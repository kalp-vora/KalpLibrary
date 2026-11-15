"use client";

import React, { useState } from "react";
import { MediaItem } from "@/types";
import {
  BookOpen,
  Film,
  Star,
  Quote,
  Sparkles,
  ArrowUpDown,
  Calendar,
  MessageSquare,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import {
  buildTimelineEntries,
  groupTimelineByPeriod,
  TimelineEntry
} from "@/lib/timelineHelpers";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";

interface TimelineSectionProps {
  items: MediaItem[];
  onSelectItem: (item: MediaItem) => void;
  onOpenReview: (item: MediaItem) => void;
  onUnmarkCompleted?: (item: MediaItem) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  items,
  onSelectItem,
  onOpenReview,
  onUnmarkCompleted,
}) => {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [filterType, setFilterType] = useState<"all" | "book" | "movie">("all");

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    if (filterType === "book") return item.type === "book";
    return item.type !== "book";
  });

  const timelineEntries = buildTimelineEntries(filteredItems, sortOrder);
  const groupedTimeline = groupTimelineByPeriod(timelineEntries);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Chronological Journey Timeline
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Every story you finished, mapped in chronological progression
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Type Filter & Sort Order */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Sub-toggle */}
          <div className="flex items-center bg-surface border border-theme-border p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filterType === "all"
                  ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterType("book")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filterType === "book"
                  ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Books</span>
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filterType === "movie"
                  ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Screen</span>
            </button>
          </div>

          {/* Sort Order Button */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-theme-border rounded-lg text-xs text-text-muted hover:text-foreground transition-colors"
            title="Toggle chronological order"
          >
            <ArrowUpDown className="w-3 h-3 text-brand-primary" />
            <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      {timelineEntries.length === 0 ? (
        <div className="p-16 rounded-3xl bg-surface-card border border-theme-border text-center">
          <Calendar className="w-12 h-12 text-brand-primary/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-foreground mb-1">
            Timeline Awaiting Milestones
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Mark books as read or movies as watched to chart your personal journey through time.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-10 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-brand-primary before:via-brand-secondary/40 before:to-transparent">
          {groupedTimeline.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-6">
              {/* Period Header Badge */}
              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-surface-card border-2 border-brand-primary flex items-center justify-center shadow-md">
                  <Sparkles className="w-3 h-3 text-brand-primary" />
                </div>
                <div className="ml-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono font-bold uppercase tracking-wider">
                  {group.periodLabel}
                </div>
              </div>

              {/* Entries under this Period */}
              <div className="space-y-4">
                {group.entries.map((entry: TimelineEntry) => {
                  const { item, formattedDate } = entry;
                  const isBook = item.type === "book";

                  return (
                    <div
                      key={item.id}
                      className="group relative bg-surface-card rounded-2xl border border-theme-border p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all ml-2"
                    >
                      {/* Node Connection Point */}
                      <div className="absolute -left-[30px] sm:-left-[38px] top-6 w-3 h-3 rounded-full bg-brand-secondary border-2 border-surface shadow-sm" />

                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Thumbnail */}
                        <div
                          onClick={() => onSelectItem(item)}
                          className="w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-surface border border-theme-border shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          {isBook ? (
                            <BookCover
                              title={item.title}
                              creator={item.creator}
                              pages={item.lengthInfo?.pages}
                              releaseYear={item.releaseYear}
                              posterUrl={item.posterUrl}
                              customColor={item.spineStyle?.color}
                              className="w-full h-full"
                            />
                          ) : (
                            <MovieCover
                              title={item.title}
                              creator={item.creator}
                              type={item.type}
                              releaseYear={item.releaseYear}
                              runtimeMinutes={item.lengthInfo?.runtimeMinutes}
                              posterUrl={item.posterUrl}
                              className="w-full h-full"
                            />
                          )}
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                isBook
                                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                                  : "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20"
                              }`}
                            >
                              {isBook ? (
                                <BookOpen className="w-2.5 h-2.5" />
                              ) : (
                                <Film className="w-2.5 h-2.5" />
                              )}
                              <span>{isBook ? "Book" : "Cinema"}</span>
                            </span>

                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </span>

                            {/* Stars */}
                            {(item.userRating || item.review?.rating) && (
                              <div className="flex items-center gap-0.5 ml-auto">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= (item.userRating || item.review?.rating || 0)
                                        ? "fill-brand-secondary text-brand-secondary"
                                        : "text-text-muted/20"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <h3
                            onClick={() => onSelectItem(item)}
                            className="font-serif text-base sm:text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors cursor-pointer line-clamp-1"
                          >
                            {item.title}
                          </h3>

                          <p className="text-xs text-brand-secondary font-medium mt-0.5 line-clamp-1">
                            {item.creator} &bull; {item.releaseYear}
                          </p>

                          {/* Reflection / Takeaways snippet */}
                          {item.review?.takeaways && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-surface border border-theme-border text-xs italic text-text-muted leading-relaxed flex items-start gap-2">
                              <Quote className="w-3 h-3 text-brand-secondary flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">&ldquo;{item.review.takeaways}&rdquo;</span>
                            </div>
                          )}

                          {/* Action Links */}
                          <div className="mt-3 pt-2.5 border-t border-theme-border flex flex-wrap items-center justify-between gap-2 text-xs">
                            <button
                              onClick={() => onSelectItem(item)}
                              className="text-brand-primary hover:underline font-medium text-[11px]"
                            >
                              View Reflections
                            </button>

                            <div className="flex items-center gap-3">
                              {onUnmarkCompleted && (
                                <button
                                  type="button"
                                  onClick={() => onUnmarkCompleted(item)}
                                  className="text-text-muted hover:text-amber-500 flex items-center gap-1 text-[11px] transition-colors"
                                  title={`Unmark as completed and return to ${isBook ? 'ReadList' : 'Watchlist'}`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Unmark</span>
                                </button>
                              )}

                              <button
                                onClick={() => onOpenReview(item)}
                                className="text-text-muted hover:text-foreground flex items-center gap-1 text-[11px]"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{item.review?.takeaways ? "Edit Journal" : "Add Reflections"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
