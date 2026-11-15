"use client";

import React, { useState } from "react";
import { MediaItem } from "@/types";
import {
  BookOpen,
  Star,
  Quote,
  Ticket,
  Calendar,
  Sparkles,
  X,
  MessageSquare
} from "lucide-react";
import {
  computePagesRead,
  computeWatchHours,
  computeAverageRating,
  computeItemCounts
} from "@/lib/mediaMetrics";
import { BookshelfSection } from "@/components/BookshelfSection";
import { CinemaTicketsSection } from "@/components/CinemaTicketsSection";
import { TimelineSection } from "@/components/TimelineSection";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";

interface BookshelfViewProps {
  items: MediaItem[];
  onOpenReview: (item: MediaItem) => void;
  onOpenDetail: (item: MediaItem) => void;
}

export type JourneyActiveSection = "all" | "books" | "movies" | "timeline";

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  items,
  onOpenReview,
  onOpenDetail
}) => {
  const [activeSection, setActiveSection] = useState<JourneyActiveSection>("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Filter only finished items
  const finishedItems = items.filter((item) => item.status === "finished");
  const finishedBooks = finishedItems.filter((item) => item.type === "book");
  const finishedMovies = finishedItems.filter((item) => item.type !== "book");

  // Metrics computed via pure utility functions
  const totalPagesRead = computePagesRead(finishedItems);
  const totalWatchHours = computeWatchHours(finishedItems);
  const avgRating = computeAverageRating(finishedItems);
  const { books: finishedBooksCount, screen: finishedMoviesCount, rated: ratedItemsCount } =
    computeItemCounts(finishedItems);

  return (
    <div className="space-y-10 pb-20 animate-fade-in text-foreground">
      {/* 1. Journey Header & Stats Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-card border border-theme-border p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Odyssey & Reflections</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              The Journey & Reflections
            </h1>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              Celebrate your lifelong cultural gallery. Revisit the books you have shelved, the cinema tickets you have collected, and follow your story through the chronological timeline.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-3.5 rounded-2xl border border-theme-border">
            <div className="px-3 py-2 text-center">
              <span className="text-[11px] text-text-muted block uppercase font-mono tracking-wider">
                Journey
              </span>
              <span className="text-2xl font-bold font-serif text-brand-secondary">
                {finishedItems.length}
              </span>
              <span className="text-[10px] text-text-subtle block">milestones reached</span>
            </div>

            <div className="px-3 py-2 text-center border-l border-theme-border">
              <span className="text-[11px] text-text-muted block uppercase font-mono tracking-wider">
                Books Read
              </span>
              <span className="text-2xl font-bold font-serif text-brand-primary">
                {finishedBooksCount}
              </span>
              <span className="text-[10px] text-text-subtle block">
                {totalPagesRead.toLocaleString()} pages
              </span>
            </div>

            <div className="px-3 py-2 text-center border-l border-theme-border">
              <span className="text-[11px] text-text-muted block uppercase font-mono tracking-wider">
                Screen Time
              </span>
              <span className="text-2xl font-bold font-serif text-brand-secondary">
                {finishedMoviesCount}
              </span>
              <span className="text-[10px] text-text-subtle block">{totalWatchHours} hrs</span>
            </div>

            <div className="px-3 py-2 text-center border-l border-theme-border">
              <span className="text-[11px] text-text-muted block uppercase font-mono tracking-wider">
                Avg Rating
              </span>
              <span className="text-2xl font-bold font-serif text-brand-secondary flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-brand-secondary text-brand-secondary" />
                {avgRating}
              </span>
              <span className="text-[10px] text-text-subtle block">{ratedItemsCount} rated</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-theme-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1 rounded-xl border border-theme-border">
            <button
              onClick={() => setActiveSection("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === "all"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm font-semibold"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              All Journey ({finishedItems.length})
            </button>
            <button
              onClick={() => setActiveSection("books")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === "books"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm font-semibold"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bookshelf ({finishedBooksCount})</span>
            </button>
            <button
              onClick={() => setActiveSection("movies")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === "movies"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm font-semibold"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Cinema Tickets ({finishedMoviesCount})</span>
            </button>
            <button
              onClick={() => setActiveSection("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === "timeline"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm font-semibold"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline ({finishedItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: BOOKS (Handcrafted Bookshelf with Levels & Simple Grid Toggle) */}
      {(activeSection === "all" || activeSection === "books") && (
        <BookshelfSection
          books={finishedBooks}
          onSelectBook={(book) => setSelectedItem(book)}
          onOpenReview={onOpenReview}
        />
      )}

      {/* 3. SECTION 2: MOVIES (Cinema Ticket Stubs & Simple Grid Toggle) */}
      {(activeSection === "all" || activeSection === "movies") && (
        <CinemaTicketsSection
          movies={finishedMovies}
          onSelectMovie={(movie) => setSelectedItem(movie)}
          onOpenReview={onOpenReview}
        />
      )}

      {/* 4. SECTION 3: CHRONOLOGICAL TIMELINE */}
      {(activeSection === "all" || activeSection === "timeline") && (
        <TimelineSection
          items={finishedItems}
          onSelectItem={(item) => setSelectedItem(item)}
          onOpenReview={onOpenReview}
        />
      )}

      {/* Selected Item / Reflections Exhibit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-foreground">
          <div className="relative w-full max-w-2xl bg-surface-card rounded-3xl border border-theme-border p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
            <button
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
              className="absolute top-5 right-5 text-text-muted hover:text-foreground p-2 rounded-full hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover Art */}
              <div className="w-full sm:w-48 h-64 sm:h-72 flex-shrink-0 rounded-md overflow-hidden shadow-2xl border border-theme-border bg-surface">
                {selectedItem.type === "book" ? (
                  <BookCover
                    title={selectedItem.title}
                    creator={selectedItem.creator}
                    pages={selectedItem.lengthInfo?.pages}
                    releaseYear={selectedItem.releaseYear}
                    posterUrl={selectedItem.posterUrl}
                    customColor={selectedItem.spineStyle?.color}
                    className="w-full h-full"
                  />
                ) : (
                  <MovieCover
                    title={selectedItem.title}
                    creator={selectedItem.creator}
                    type={selectedItem.type}
                    releaseYear={selectedItem.releaseYear}
                    runtimeMinutes={selectedItem.lengthInfo?.runtimeMinutes}
                    posterUrl={selectedItem.posterUrl}
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Details & Review */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-brand-primary font-semibold bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                      {selectedItem.type}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      Finished on {selectedItem.review?.finishedDate || "Recently"}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-brand-secondary font-medium mb-3">
                    {selectedItem.creator} &bull; {selectedItem.releaseYear}
                  </p>

                  {/* Rating Stars */}
                  {selectedItem.review?.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (selectedItem.review?.rating || 0)
                              ? "fill-brand-secondary text-brand-secondary"
                              : "text-text-muted/30"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-brand-secondary font-mono ml-1.5 font-bold">
                        {selectedItem.review.rating}/5
                      </span>
                    </div>
                  )}

                  {/* Thoughts & Takeaways Journal Note */}
                  <div className="space-y-3 bg-surface p-4 rounded-2xl border border-theme-border">
                    {selectedItem.review?.takeaways && (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-brand-primary font-semibold flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-brand-primary" />
                          Key Takeaway & Life Lesson
                        </span>
                        <p className="text-xs sm:text-sm text-foreground italic leading-relaxed">
                          &ldquo;{selectedItem.review.takeaways}&rdquo;
                        </p>
                      </div>
                    )}

                    {selectedItem.review?.thoughts && (
                      <div className="pt-2 border-t border-theme-border">
                        <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block mb-1">
                          Thoughts & Impressions
                        </span>
                        <p className="text-xs text-foreground leading-relaxed">
                          {selectedItem.review.thoughts}
                        </p>
                      </div>
                    )}

                    {selectedItem.review?.favoriteQuote && (
                      <div className="pt-2 border-t border-theme-border">
                        <span className="text-[11px] uppercase tracking-wider text-brand-secondary font-semibold flex items-center gap-1 mb-1">
                          <Quote className="w-3 h-3 text-brand-secondary" />
                          Memorable Quote / Line
                        </span>
                        <p className="text-xs text-brand-secondary font-serif italic">
                          {selectedItem.review.favoriteQuote}
                        </p>
                      </div>
                    )}

                    {!selectedItem.review?.takeaways && !selectedItem.review?.thoughts && (
                      <p className="text-xs text-text-muted italic">
                        No thoughts recorded yet. Click &ldquo;Edit Thoughts&rdquo; below to write your takeaways!
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-theme-border flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const item = selectedItem;
                      setSelectedItem(null);
                      onOpenDetail(item);
                    }}
                    className="text-xs text-text-muted hover:text-foreground underline"
                  >
                    View Full Details
                  </button>

                  <button
                    onClick={() => {
                      const item = selectedItem;
                      setSelectedItem(null);
                      onOpenReview(item);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Edit Thoughts & Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
