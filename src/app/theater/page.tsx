"use client";

import { useState, useMemo } from "react";
import { AppShell, useApp } from "@/components/AppShell";
import { OnlineSearchSection } from "@/components/OnlineSearchSection";
import { MediaCard } from "@/components/MediaCard";
import { Film, Tv, Filter } from "lucide-react";
import { sortMediaItems } from "@/lib/sorting";
import { computeGenreBreakdown } from "@/lib/mediaMetrics";

function TheaterContent() {
  const {
    items,
    existingTitles,
    onAddItem,
    onStatusChange,
    onOpenDetail,
    onOpenReview
  } = useApp();

  const [theatreCategory, setTheatreCategory] = useState<"all" | "movie" | "tv" | "anime">("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const theatreMoviesCount = useMemo(() => items.filter((i) => i.type === "movie").length, [items]);
  const theatreTvCount = useMemo(() => items.filter((i) => i.type === "tv").length, [items]);
  const theatreAnimeCount = useMemo(() => items.filter((i) => i.type === "anime").length, [items]);
  const theatreAllCount = theatreMoviesCount + theatreTvCount + theatreAnimeCount;

  // Filter and sort screen items using strategy pattern & pure search utility
  const screenItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (item.type === "book") return false;
      if (theatreCategory !== "all" && item.type !== theatreCategory) return false;
      if (selectedGenre !== "all" && !item.genres?.includes(selectedGenre)) return false;
      return true;
    });

    return sortMediaItems(filtered, "dateAdded", "desc");
  }, [items, theatreCategory, selectedGenre]);

  // Compute available genres for selected screen category via pure metrics utility
  const availableGenres = useMemo(() => {
    return computeGenreBreakdown(
      items,
      (i) => i.type !== "book" && (theatreCategory === "all" || i.type === theatreCategory)
    );
  }, [items, theatreCategory]);

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Tripartite Sub-Category Switcher for Theater */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-card border border-theme-border shadow-theme-card">
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-theme-border text-xs">
          <button
            onClick={() => {
              setTheatreCategory("all");
              setSelectedGenre("all");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              theatreCategory === "all"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>All Screen ({theatreAllCount})</span>
          </button>
          <button
            onClick={() => {
              setTheatreCategory("movie");
              setSelectedGenre("all");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              theatreCategory === "movie"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies ({theatreMoviesCount})</span>
          </button>
          <button
            onClick={() => {
              setTheatreCategory("tv");
              setSelectedGenre("all");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              theatreCategory === "tv"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV Series ({theatreTvCount})</span>
          </button>
          <button
            onClick={() => {
              setTheatreCategory("anime");
              setSelectedGenre("all");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              theatreCategory === "anime"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Anime ({theatreAnimeCount})</span>
          </button>
        </div>

        <span className="text-xs text-text-muted">
          {theatreCategory === "movie"
            ? "Feature films & cinema"
            : theatreCategory === "tv"
            ? "Multi-season television series"
            : theatreCategory === "anime"
            ? "Simulcasts & anime productions"
            : "All screen experiences"}
        </span>
      </div>

      {/* Online Screen Search Panel */}
      <OnlineSearchSection
        type={theatreCategory === "all" ? "movie" : theatreCategory}
        onAddItem={onAddItem}
        existingItemTitles={existingTitles}
        existingItems={items}
        onOpenReview={onOpenReview}
      />

      {/* Saved Cinema & Series Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-theme-border">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-secondary" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              {theatreCategory === "movie"
                ? "Your Movie Collection"
                : theatreCategory === "tv"
                ? "Your TV Series Collection"
                : theatreCategory === "anime"
                ? "Your Anime Collection"
                : "Your Cinema & Series Collection"}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-theme-border text-text-muted font-mono">
              {screenItems.length}
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

        {/* Grid of Movies / TV / Anime */}
        {screenItems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface-card border border-theme-border text-center space-y-3">
            <Film className="w-12 h-12 text-text-muted/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              No titles found in this category
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Use the search bar above to fetch {theatreCategory === "anime" ? "anime" : theatreCategory === "tv" ? "TV series" : "movies"} from free online resources and add them to your Watchlist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {screenItems.map((item) => (
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

export default function TheaterPage() {
  return (
    <AppShell>
      <TheaterContent />
    </AppShell>
  );
}
