"use client";

import React, { useState } from "react";
import { MediaItem } from "@/types";
import {
  BookOpen,
  LayoutGrid,
  Star,
  MessageSquare,
  CheckCircle2,
  BookMarked
} from "lucide-react";
import { chunkIntoShelves } from "@/lib/mediaMetrics";
import { BookCover } from "@/components/BookCover";
import { fireCelebration } from "@/lib/celebrate";

interface BookshelfSectionProps {
  books: MediaItem[];
  onSelectBook: (book: MediaItem) => void;
  onOpenReview: (book: MediaItem) => void;
}

export const BookshelfSection: React.FC<BookshelfSectionProps> = ({
  books,
  onSelectBook,
  onOpenReview
}) => {
  const [viewMode, setViewMode] = useState<"shelf" | "grid">("shelf");

  // Chunk books into shelves of up to 10 books per shelf level
  const shelves = chunkIntoShelves(books, 10);

  return (
    <section className="space-y-6">
      {/* Section Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                The Reading Room & Bookshelf
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Completed literary journeys organized across custom shelf levels
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher: Shelf Spines vs Simple Grid */}
        <div className="flex items-center bg-surface border border-theme-border p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode("shelf")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === "shelf"
                ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
            title="Display as physical wooden bookshelf"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Shelf Spines</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
            title="Display as simple grid cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Simple Grid</span>
          </button>
        </div>
      </div>

      {/* MODE 1: PHYSICAL WOODEN BOOKSHELF WITH MULTIPLE LEVELS */}
      {viewMode === "shelf" && (
        <div className="relative rounded-3xl p-6 sm:p-10 shadow-2xl shelf-backwall border-4 border-[#2b170c]">
          {/* Overhead warm lighting */}
          <div className="absolute top-0 left-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {books.length === 0 ? (
            <div className="py-20 text-center">
              <BookMarked className="w-14 h-14 text-amber-300/60 mx-auto mb-3 animate-bounce" />
              <h3 className="font-serif text-xl font-bold text-amber-200 mb-2">
                Your Bookshelf Awaits Its First Volume
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                When you finish reading a book from your ReadList, mark it as read. It will take its place upon these handcrafted shelves!
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {shelves.map((shelfBooks, shelfIndex) => (
                <div key={shelfIndex} className="relative">
                  {/* Spines Row */}
                  <div className="relative z-10 flex items-end justify-start gap-1 sm:gap-2 px-4 sm:px-8 h-72 sm:h-80 overflow-x-auto pb-0">
                    {shelfBooks.map((item) => {
                      const spineStyle = item.spineStyle || {
                        color: "#1e3a5f",
                        textColor: "light",
                        accentColor: "#f59e0b",
                        thicknessPx: 38,
                        heightPercent: 94
                      };

                      const heightStyle = `${spineStyle.heightPercent || 92}%`;
                      const thicknessStyle = `${spineStyle.thicknessPx || 38}px`;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            fireCelebration({ particleCount: 30, spread: 50 });
                            onSelectBook(item);
                          }}
                          style={{
                            height: heightStyle,
                            width: thicknessStyle,
                            backgroundColor: spineStyle.color,
                            borderColor: spineStyle.accentColor
                          }}
                          className="book-spine cursor-pointer flex-shrink-0 rounded-t-sm border-t-2 border-r border-l border-white/10 shadow-book flex flex-col justify-between py-3 px-1 items-center relative group hover:-translate-y-2 transition-transform duration-200"
                          title={`${item.title} by ${item.creator} — Click to inspect reflections`}
                        >
                          {/* Bookmark Ribbon */}
                          <div
                            style={{ backgroundColor: spineStyle.accentColor }}
                            className="w-1.5 h-6 rounded-b shadow-md absolute -bottom-3 left-1/2 -translate-x-1/2 z-20"
                          />

                          {/* Top Rating / Icon Badge */}
                          <div className="flex flex-col items-center">
                            {item.userRating ? (
                              <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-300 font-mono">
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                <span>{item.userRating}</span>
                              </div>
                            ) : (
                              <BookOpen className="w-2.5 h-2.5 text-white/80" />
                            )}
                          </div>

                          {/* Spine Title (Vertical writing) */}
                          <div className="flex-1 flex items-center justify-center my-2 overflow-hidden w-full">
                            <span className="font-serif font-bold text-xs sm:text-sm tracking-wide text-white/95 uppercase transform -rotate-90 whitespace-nowrap block max-w-[190px] truncate text-center drop-shadow">
                              {item.title}
                            </span>
                          </div>

                          {/* Bottom Creator */}
                          <div className="text-center w-full overflow-hidden">
                            <span className="text-[9px] font-mono uppercase tracking-tighter opacity-80 block truncate max-w-full text-white/80">
                              {item.creator.split(" ").pop()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Wooden Shelf Slab */}
                  <div className="wood-shelf h-7 w-full rounded-b-md shadow-shelf flex items-center justify-between px-6">
                    <span className="text-[10px] font-serif font-semibold text-amber-200/60 uppercase tracking-widest">
                      Shelf Level {shelfIndex + 1}
                    </span>
                    <span className="text-[10px] font-serif font-semibold text-amber-200/60 uppercase tracking-widest">
                      {shelfBooks.length} {shelfBooks.length === 1 ? "Book" : "Books"} Shelved
                    </span>
                  </div>

                  <div className="shelf-shadow h-6 w-full -mt-0.5 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: SIMPLE GRID VIEW */}
      {viewMode === "grid" && (
        <div>
          {books.length === 0 ? (
            <div className="p-16 rounded-3xl bg-surface-card border border-theme-border text-center">
              <BookOpen className="w-12 h-12 text-brand-primary/40 mx-auto mb-3" />
              <p className="text-text-muted text-sm">No books marked as read yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-surface-card rounded-3xl border border-theme-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all group"
                >
                  <div>
                    <div className="flex gap-4">
                      {/* Cover Thumbnail */}
                      <div
                        onClick={() => onSelectBook(book)}
                        className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden bg-surface border border-theme-border cursor-pointer shadow-md group-hover:scale-105 transition-transform"
                      >
                        <BookCover
                          title={book.title}
                          creator={book.creator}
                          pages={book.lengthInfo?.pages}
                          releaseYear={book.releaseYear}
                          posterUrl={book.posterUrl}
                          customColor={book.spineStyle?.color}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                            Book
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Read
                          </span>
                        </div>

                        <h3
                          onClick={() => onSelectBook(book)}
                          className="font-serif text-base font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1 cursor-pointer"
                        >
                          {book.title}
                        </h3>

                        <p className="text-xs text-brand-secondary font-medium line-clamp-1">
                          {book.creator}
                        </p>

                        {/* Stars */}
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (book.userRating || book.review?.rating || 5)
                                  ? "fill-brand-secondary text-brand-secondary"
                                  : "text-text-muted/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reflection / Takeaways snippet */}
                    {book.review?.takeaways && (
                      <div className="mt-3 p-3 rounded-2xl bg-surface border border-theme-border text-xs italic text-text-muted leading-relaxed">
                        &ldquo;{book.review.takeaways}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between text-xs text-text-muted">
                    <span className="font-mono text-[11px]">
                      {book.lengthInfo?.pages ? `${book.lengthInfo.pages} pages` : "Completed"}
                    </span>

                    <button
                      onClick={() => onOpenReview(book)}
                      className="text-brand-primary hover:text-brand-primary-hover font-semibold text-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{book.review?.takeaways ? "Edit Journal" : "Add Reflections"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
