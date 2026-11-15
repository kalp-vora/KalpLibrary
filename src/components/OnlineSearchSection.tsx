"use client";

import { useState } from "react";
import {
  BookOpen,
  Film,
  Check,
  Clock,
  Bookmark,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { MediaType, MediaItem, ItemStatus } from "@/types";
import { SearchResultItem, searchOnlineBooks, searchOnlineMovies, searchItemToMediaItem } from "@/lib/onlineResources";
import { getMediaConfig, getStatusConfig } from "@/lib/mediaConfig";
import { recordSearch } from "@/lib/searchHistory";
import { fireCelebration } from "@/lib/celebrate";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { SearchBar } from "@/components/SearchBar";

interface OnlineSearchSectionProps {
  type: "book" | "movie" | "tv" | "anime";
  onAddItem: (item: MediaItem) => void;
  existingItemTitles: string[];
}

export const OnlineSearchSection: React.FC<OnlineSearchSectionProps> = ({
  type,
  onAddItem,
  existingItemTitles
}) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, string>>({});

  const isBook = type === "book";
  const mediaConfig = getMediaConfig(type);
  const sampleQueries = mediaConfig.sampleQueries;

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || query).trim();
    if (!q) return;

    if (customQuery) setQuery(customQuery);
    setIsSearching(true);
    setHasSearched(true);
    recordSearch(q, type as MediaType);

    try {
      let searchResults: SearchResultItem[] = [];
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
        if (res.ok) {
          const json = await res.json();
          if (json.results && json.results.length > 0) {
            searchResults = json.results;
          }
        }
      } catch {
        // fallback
      }

      if (searchResults.length === 0) {
        searchResults = isBook ? await searchOnlineBooks(q) : await searchOnlineMovies(q);
      }

      // Ensure appropriate type tagging
      const tagged = searchResults.map((r) => ({ ...r, type: r.type || (type as MediaType) }));
      setResults(tagged);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddWithStatus = (item: SearchResultItem, status: ItemStatus) => {
    fireCelebration();
    recordSearch(query || item.title, type as MediaType, {
      clickedTitle: item.title,
      genres: item.genres,
      creator: item.creator,
    });
    const mediaItem = searchItemToMediaItem({ ...item, type: item.type || (type as MediaType) }, status);
    onAddItem(mediaItem);

    const statusConfig = getStatusConfig(status);
    const label = statusConfig.getAddedMessage(type);

    setAddedIds((prev) => ({ ...prev, [item.id]: label }));
  };

  const isAlreadyInCollection = (title: string) => {
    return existingItemTitles.some(
      (t) => t.toLowerCase().trim() === title.toLowerCase().trim()
    );
  };

  return (
    <div className="rounded-2xl bg-surface-card border border-theme-border p-5 sm:p-7 shadow-theme-card space-y-5">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
              isBook
                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                : "bg-brand-secondary/15 border-brand-secondary/30 text-brand-secondary"
            }`}
          >
            {isBook ? <BookOpen className="w-5 h-5" /> : <Film className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Search {mediaConfig.label}
            </h2>
            <p className="text-xs text-text-muted">
              {mediaConfig.searchArchiveDescription}
            </p>
          </div>
        </div>

        {/* Online source badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-theme-border text-[11px] font-mono text-brand-primary self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span>Open Archives</span>
        </div>
      </div>

      {/* Reusable SearchBar with 500ms Debounced Auto-Search & Auto-Suggestions */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={(q) => handleSearch(undefined, q)}
        type={type as MediaType}
        placeholder={mediaConfig.searchPlaceholder}
        isSearching={isSearching}
        debounceMs={500}
        suggestions={[...sampleQueries, ...existingItemTitles]}
        autoSearch={true}
      />

      {/* Quick Search Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-text-subtle font-mono shrink-0">Suggestions:</span>
        {sampleQueries.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => handleSearch(undefined, sample)}
            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-card text-foreground border border-theme-border shrink-0 text-xs transition-colors shadow-sm"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isSearching && (
        <div className="p-8 text-center rounded-xl bg-surface border border-theme-border space-y-2">
          <div className="inline-block animate-spin text-xl">⏳</div>
          <p className="text-xs text-text-muted font-medium">
            Fetching details, authors, and cover art...
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isSearching && hasSearched && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Found <strong>{results.length}</strong> online {mediaConfig.label.toLowerCase()}s for &ldquo;{query}&rdquo;
            </span>
            {results.length > 0 && (
              <button
                onClick={() => {
                  setResults([]);
                  setHasSearched(false);
                  setQuery("");
                }}
                className="text-text-subtle hover:text-brand-primary underline text-[11px]"
              >
                Clear Results
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface border border-theme-border">
              <p className="text-sm text-text-muted">
                No results found for &ldquo;{query}&rdquo;. Try another search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((item) => {
                const alreadyAdded = isAlreadyInCollection(item.title);
                const addedFeedback = addedIds[item.id];

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-surface border border-theme-border hover:border-brand-primary/40 transition-all flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-lg group animate-fade-in-up"
                  >
                    {/* Poster / Cover */}
                    <div className="w-full sm:w-28 h-40 shrink-0 rounded-md overflow-hidden bg-surface-card border border-theme-border relative shimmer-overlay">
                      {isBook ? (
                        <BookCover
                          title={item.title}
                          creator={item.creator}
                          pages={item.lengthInfo?.pages}
                          releaseYear={item.releaseYear}
                          releaseDate={item.releaseDate}
                          posterUrl={item.posterUrl}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <MovieCover
                          title={item.title}
                          creator={item.creator}
                          type={item.type || type}
                          releaseYear={item.releaseYear}
                          runtimeMinutes={item.lengthInfo?.runtimeMinutes}
                          posterUrl={item.posterUrl}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>

                    {/* Details & Actions */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-base font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          {item.source && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-card text-brand-primary font-mono border border-theme-border shrink-0">
                              {item.source}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-brand-secondary font-medium line-clamp-1">
                          {mediaConfig.creatorPrefix}{item.creator}
                        </p>

                        {/* Metadata row */}
                        <div className="flex items-center gap-2 text-[11px] text-text-subtle font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.releaseDate || item.releaseYear}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {mediaConfig.formatLength(item.lengthInfo)}
                          </span>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.genres?.slice(0, 3).map((g) => (
                            <span
                              key={g}
                              className="text-[10px] px-2 py-0.5 rounded bg-surface-card border border-theme-border text-text-muted"
                            >
                              {g}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-text-muted line-clamp-2 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-theme-border-subtle flex flex-wrap items-center gap-2">
                        {addedFeedback ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
                            <Check className="w-4 h-4" />
                            <span>{addedFeedback}</span>
                          </div>
                        ) : (
                          <>
                            {/* Primary Button */}
                            <button
                              onClick={() => handleAddWithStatus(item, "to_experience")}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg shadow-sm transition-all"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>+ Add to {mediaConfig.queueName}</span>
                            </button>

                            {/* Secondary Button */}
                            <button
                              onClick={() => handleAddWithStatus(item, "in_progress")}
                              title={`Mark as Currently ${mediaConfig.actionVerb}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-card hover:bg-surface text-foreground border border-theme-border transition-all shadow-sm"
                            >
                              <Flame className="w-3 h-3 text-brand-secondary" />
                              <span>{mediaConfig.actionVerb}</span>
                            </button>

                            {/* Tertiary Button */}
                            <button
                              onClick={() => handleAddWithStatus(item, "finished")}
                              title="Directly add to completed stack"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-card hover:bg-surface text-foreground border border-theme-border transition-all shadow-sm"
                            >
                              <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                              <span>Completed</span>
                            </button>
                          </>
                        )}

                        {alreadyAdded && !addedFeedback && (
                          <span className="text-[10px] text-text-subtle italic ml-auto font-mono">
                            In collection
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
