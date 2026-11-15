"use client";

import { useState, useMemo } from "react";
import { AppShell, useApp } from "@/components/AppShell";
import { OnlineSearchSection } from "@/components/OnlineSearchSection";
import { MediaCard } from "@/components/MediaCard";
import { BookOpen, Filter, BookMarked } from "lucide-react";
import { sortMediaItems } from "@/lib/sorting";
import { computeGenreBreakdown } from "@/lib/mediaMetrics";

function LibraryContent() {
  const {
    items,
    existingTitles,
    onAddItem,
    onStatusChange,
    onOpenDetail,
    onOpenReview
  } = useApp();

  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Filter and sort book items using strategy pattern & pure search utility
  const bookItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (item.type !== "book") return false;
      if (selectedGenre !== "all" && !item.genres?.includes(selectedGenre)) return false;
      return true;
    });

    return sortMediaItems(filtered, "dateAdded", "desc");
  }, [items, selectedGenre]);

  // Compute available genres for books via pure metrics utility
  const availableGenres = useMemo(() => {
    return computeGenreBreakdown(items, (i) => i.type === "book");
  }, [items]);

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Online Book Search Panel */}
      <OnlineSearchSection
        type="book"
        onAddItem={onAddItem}
        existingItemTitles={existingTitles}
      />

      {/* Saved Books Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-theme-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-primary" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Your Book Collection
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-theme-border text-text-muted font-mono">
              {bookItems.length}
            </span>
          </div>

          {/* Genre filter strip */}
          {availableGenres.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-text-muted uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3 h-3" />
              </span>
              <button
                onClick={() => setSelectedGenre("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGenre === "all"
                    ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                    : "bg-surface text-text-muted hover:text-foreground border border-theme-border"
                }`}
              >
                All
              </button>
              {availableGenres.slice(0, 5).map(({ genre, count }) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(selectedGenre === genre ? "all" : genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    selectedGenre === genre
                      ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                      : "bg-surface text-text-muted hover:text-foreground border border-theme-border"
                  }`}
                >
                  <span>{genre}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid of Books */}
        {bookItems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface-card border border-theme-border text-center space-y-3">
            <BookMarked className="w-12 h-12 text-text-muted/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              No books found in this view
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Use the search bar above to fetch any book from free online resources and add it to your ReadList.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bookItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onSelect={onOpenDetail}
                onStatusChange={onStatusChange}
                onOpenReview={onOpenReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <AppShell>
      <LibraryContent />
    </AppShell>
  );
}
