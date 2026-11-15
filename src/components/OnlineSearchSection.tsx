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
  Sparkles,
  Plus,
  AlertCircle,
  X,
} from "lucide-react";
import { MediaType, MediaItem, ItemStatus } from "@/types";
import {
  SearchResultItem,
  searchOnlineBooks,
  searchOnlineMovies,
  searchItemToMediaItem,
} from "@/lib/onlineResources";
import { getMediaConfig, getStatusConfig } from "@/lib/mediaConfig";
import { recordSearch } from "@/lib/searchHistory";
import { fireCelebration } from "@/lib/celebrate";
import { normalizeMediaTitle, deduplicateSearchResults } from "@/lib/searchFilters";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { SearchBar } from "@/components/SearchBar";

interface OnlineSearchSectionProps {
  type: "book" | "movie" | "tv" | "anime";
  onAddItem: (item: MediaItem) => void;
  existingItemTitles: string[];
  existingItems?: MediaItem[];
  onOpenReview?: (item: MediaItem) => void;
}

export const OnlineSearchSection: React.FC<OnlineSearchSectionProps> = ({
  type,
  onAddItem,
  existingItemTitles,
  existingItems,
  onOpenReview,
}) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, string>>({});

  // Custom manual entry state
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCreator, setCustomCreator] = useState("");
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());
  const [customLength, setCustomLength] = useState<number>(type === "book" ? 320 : 120);
  const [customGenre, setCustomGenre] = useState<string>(type === "book" ? "Literature" : "Cinema");
  const [customError, setCustomError] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState<string | null>(null);

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
    setCustomError(null);
    setCustomFeedback(null);
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

      // Strictly enforce media boundary: zero books in theater, zero movies in library
      const strictResults = searchResults.filter((r) => {
        if (isBook) {
          return r.type === "book";
        } else {
          return r.type !== "book";
        }
      });

      const tagged = strictResults.map((r) => ({
        ...r,
        type: isBook ? ("book" as const) : r.type || (type as MediaType),
      }));

      // Deduplicate across multi-source candidates
      const deduped = deduplicateSearchResults(tagged);
      setResults(deduped);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const getCollectionStatus = (title: string) => {
    const norm = normalizeMediaTitle(title);
    if (existingItems && existingItems.length > 0) {
      const match = existingItems.find(
        (i) =>
          (isBook ? i.type === "book" : i.type !== "book") &&
          (i.title.toLowerCase().trim() === title.toLowerCase().trim() ||
            normalizeMediaTitle(i.title) === norm)
      );
      if (match) {
        return {
          inCollection: true,
          status: match.status,
          label:
            match.status === "to_experience"
              ? `In ${isBook ? "ReadList" : "Watchlist"}`
              : match.status === "in_progress"
              ? `Currently ${mediaConfig.actionVerb}`
              : "In Journey (Completed)",
        };
      }
    }
    const has = existingItemTitles.some(
      (t) =>
        t.toLowerCase().trim() === title.toLowerCase().trim() ||
        normalizeMediaTitle(t) === norm
    );
    return {
      inCollection: has,
      label: has ? "In collection" : undefined,
    };
  };

  const handleAddWithStatus = (item: SearchResultItem, status: ItemStatus) => {
    // Check duplicate
    const check = getCollectionStatus(item.title);
    if (check.inCollection && check.status === status) {
      setAddedIds((prev) => ({
        ...prev,
        [item.id]: `Already ${check.label}`,
      }));
      return;
    }

    fireCelebration();
    recordSearch(query || item.title, type as MediaType, {
      clickedTitle: item.title,
      genres: item.genres,
      creator: item.creator,
    });
    const mediaItem = searchItemToMediaItem(
      { ...item, type: item.type || (type as MediaType) },
      status
    );
    onAddItem(mediaItem);

    if (status === "finished" && onOpenReview) {
      onOpenReview(mediaItem);
    }

    const statusConfig = getStatusConfig(status);
    const label = statusConfig.getAddedMessage(type);

    setAddedIds((prev) => ({ ...prev, [item.id]: label }));
  };

  const handleCustomSubmit = (targetStatus: ItemStatus, prefilledTitle?: string) => {
    const rawTitle = prefilledTitle || customTitle || query;
    const titleToUse = rawTitle.trim();
    if (!titleToUse) {
      setCustomError("Please enter a title.");
      return;
    }

    const check = getCollectionStatus(titleToUse);
    if (check.inCollection) {
      setCustomError(`"${titleToUse}" is already in your ${check.label || "collection"}.`);
      return;
    }

    setCustomError(null);
    fireCelebration();

    const searchItem: SearchResultItem = {
      id: `custom-${Date.now()}`,
      type: (isBook ? "book" : type) as MediaType,
      title: titleToUse,
      creator: customCreator.trim() || (isBook ? "Independent Author" : "Acclaimed Director"),
      releaseYear: customYear || new Date().getFullYear(),
      releaseDate: `${customYear || new Date().getFullYear()}`,
      genres: [customGenre || (isBook ? "Literature" : "Cinema")],
      description: `Personal custom ${isBook ? "book" : "movie"} entry.`,
      posterUrl: "",
      source: "Personal Entry",
      lengthInfo: isBook
        ? { pages: customLength || 320 }
        : { runtimeMinutes: customLength || 120 },
      criticRating: 9.0,
    };

    const mediaItem = searchItemToMediaItem(searchItem, targetStatus);
    onAddItem(mediaItem);

    if (targetStatus === "finished" && onOpenReview) {
      onOpenReview(mediaItem);
    }

    const statusConfig = getStatusConfig(targetStatus);
    const msg = statusConfig.getAddedMessage(type);
    setCustomFeedback(msg);
    setCustomTitle("");
    setCustomCreator("");
    setIsCustomOpen(false);
  };

  const renderCustomEntryForm = (initialTitle = "") => {
    return (
      <div className="space-y-4">
        {customError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{customError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
              {isBook ? "Book Title" : "Movie / Show Title"} *
            </label>
            <input
              type="text"
              placeholder={initialTitle || (isBook ? "e.g. The Silmarillion" : "e.g. Interstellar")}
              value={customTitle || initialTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-theme-border text-foreground text-xs placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
              {isBook ? "Author" : "Director / Studio"}
            </label>
            <input
              type="text"
              placeholder={isBook ? "e.g. J.R.R. Tolkien" : "e.g. Christopher Nolan"}
              value={customCreator}
              onChange={(e) => setCustomCreator(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-theme-border text-foreground text-xs placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
              Release Year
            </label>
            <input
              type="number"
              value={customYear}
              onChange={(e) => setCustomYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-theme-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
              {isBook ? "Page Count" : "Runtime (Minutes)"}
            </label>
            <input
              type="number"
              value={customLength}
              onChange={(e) => setCustomLength(parseInt(e.target.value, 10) || (isBook ? 320 : 120))}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-theme-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
              Genre
            </label>
            <input
              type="text"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-theme-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-theme-border/60">
          <button
            type="button"
            onClick={() => handleCustomSubmit("to_experience", initialTitle)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg shadow-sm transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>+ Add to {mediaConfig.queueName} (Wishlist)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCustomSubmit("finished", initialTitle)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-surface-card hover:bg-surface text-foreground border border-theme-border transition-all shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
            <span>+ Record in Journey (Completed)</span>
          </button>
        </div>
      </div>
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
            <p className="text-xs text-text-muted">{mediaConfig.searchArchiveDescription}</p>
          </div>
        </div>

        {/* Online source badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-theme-border text-[11px] font-mono text-brand-primary self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span>Authentic Open Catalogs</span>
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
            Searching authentic open catalogs...
          </p>
        </div>
      )}

      {/* Custom Entry Feedback */}
      {customFeedback && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{customFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setCustomFeedback(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-75"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Results Grid */}
      {!isSearching && hasSearched && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Found <strong>{results.length}</strong> authentic {mediaConfig.label.toLowerCase()}s
              for &ldquo;{query}&rdquo;
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
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-theme-border text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Couldn&apos;t find &ldquo;{query}&rdquo; in open catalogs
                </h3>
                <p className="text-xs text-text-muted">
                  We maintain authentic, verified sources. Since no catalog match was found, you
                  can enter &ldquo;{query}&rdquo; directly into your {mediaConfig.queueName} (Wishlist) or
                  record it in your Journey as completed.
                </p>
              </div>

              <div className="max-w-xl mx-auto text-left pt-2 p-5 rounded-2xl bg-surface-card border border-theme-border">
                {renderCustomEntryForm(query)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((item) => {
                const collectionStatus = getCollectionStatus(item.title);
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
                          {mediaConfig.creatorPrefix}
                          {item.creator}
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

                        {collectionStatus.inCollection && !addedFeedback && (
                          <span className="text-[10px] text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded-full ml-auto font-mono">
                            {collectionStatus.label}
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

      {/* Manual Custom Entry Toggle for any item not present in open archives */}
      <div className="pt-2 border-t border-theme-border/60">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Can&apos;t find your specific {isBook ? "edition" : "movie"}?</span>
          <button
            type="button"
            onClick={() => {
              setIsCustomOpen(!isCustomOpen);
              setCustomError(null);
            }}
            className="inline-flex items-center gap-1 text-brand-primary hover:underline font-medium text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {isCustomOpen ? "Close custom form" : `Add custom ${isBook ? "book" : "movie"}`}
            </span>
          </button>
        </div>

        {isCustomOpen && (
          <div className="p-5 rounded-2xl bg-surface border border-theme-border mt-3 animate-fade-in">
            <h4 className="font-serif text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Enter Custom {isBook ? "Book" : "Movie"} Details</span>
            </h4>
            {renderCustomEntryForm()}
          </div>
        )}
      </div>
    </div>
  );
};
