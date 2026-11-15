"use client";

import { useState, useMemo } from "react";
import { MediaItem, ItemStatus, MediaType } from "@/types";
import {
  Bookmark,
  BookOpen,
  Film,
  Tv,
  CheckCircle2,
  Flame,
  Search,
  Clock,
  Trash2,
  Columns,
  ArrowRight
} from "lucide-react";
import { getMediaConfig } from "@/lib/mediaConfig";
import { filterMediaBySearch, deduplicateMediaItems } from "@/lib/searchFilters";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { fireCelebration } from "@/lib/celebrate";

const MEDIA_ICONS: Record<MediaType, React.ReactNode> = {
  book: <BookOpen className="w-3 h-3 text-brand-primary" />,
  movie: <Film className="w-3 h-3 text-brand-secondary" />,
  tv: <Tv className="w-3 h-3 text-brand-secondary" />,
  anime: <Film className="w-3 h-3 text-brand-secondary" />,
};

interface QueueListViewProps {
  items: MediaItem[];
  onMarkFinished: (item: MediaItem) => void;
  onStatusChange: (item: MediaItem, newStatus: ItemStatus) => void;
  onDeleteItem: (id: string) => void;
  onOpenDetail: (item: MediaItem) => void;
  onNavigateToLibrary: () => void;
  onNavigateToTheatre: () => void;
}

export const QueueListView: React.FC<QueueListViewProps> = ({
  items,
  onMarkFinished,
  onStatusChange,
  onDeleteItem,
  onOpenDetail,
  onNavigateToLibrary,
  onNavigateToTheatre
}) => {
  // Mode: "divided" shows both in distinct sections, "readlist" or "watchlist" shows one dedicated queue
  const [listMode, setListMode] = useState<"divided" | "readlist" | "watchlist">("divided");
  const [searchQuery, setSearchQuery] = useState("");

  const queueItems = useMemo(() => {
    return deduplicateMediaItems(
      items.filter((item) => item.status === "to_experience" || item.status === "in_progress")
    );
  }, [items]);

  const inProgressItems = useMemo(() => {
    return queueItems.filter((i) => i.status === "in_progress");
  }, [queueItems]);

  const readListPending = useMemo(() => {
    return queueItems.filter((i) => i.type === "book" && i.status === "to_experience");
  }, [queueItems]);

  const watchListPending = useMemo(() => {
    return queueItems.filter((i) => (i.type === "movie" || i.type === "tv" || i.type === "anime") && i.status === "to_experience");
  }, [queueItems]);

  const filteredReadList = useMemo(() => filterMediaBySearch(readListPending, searchQuery), [readListPending, searchQuery]);
  const filteredWatchList = useMemo(() => filterMediaBySearch(watchListPending, searchQuery), [watchListPending, searchQuery]);
  const filteredInProgress = useMemo(() => filterMediaBySearch(inProgressItems, searchQuery), [inProgressItems, searchQuery]);

  // Render an individual card
  const renderItemCard = (item: MediaItem) => {
    const mediaConfig = getMediaConfig(item.type);
    const isInProgress = item.status === "in_progress";

    return (
      <div
        key={item.id}
        className="group relative bg-surface-card hover:bg-surface rounded-2xl border border-theme-border hover:border-brand-primary/40 p-4 transition-all duration-300 flex flex-col justify-between shadow-theme-card hover:shadow-2xl hover:-translate-y-1.5 animate-fade-in-up"
      >
        <div>
          <div className="flex gap-4">
            {/* Poster thumbnail */}
            <div
              onClick={() => onOpenDetail(item)}
              className="w-24 h-36 shrink-0 rounded-md overflow-hidden bg-surface border border-theme-border cursor-pointer shadow-sm relative shimmer-overlay"
            >
              {item.type === "book" ? (
                <BookCover
                  title={item.title}
                  creator={item.creator}
                  pages={item.lengthInfo?.pages}
                  releaseYear={item.releaseYear}
                  posterUrl={item.posterUrl}
                  customColor={item.spineStyle?.color}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <MovieCover
                  title={item.title}
                  creator={item.creator}
                  type={item.type}
                  releaseYear={item.releaseYear}
                  runtimeMinutes={item.lengthInfo?.runtimeMinutes}
                  posterUrl={item.posterUrl}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>

            {/* Metadata info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface text-brand-primary border border-theme-border">
                  {MEDIA_ICONS[item.type] || MEDIA_ICONS.movie}
                  <span>{mediaConfig.label}</span>
                </span>

                {isInProgress && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30">
                    <Flame className="w-3 h-3 animate-pulse" />
                    <span>In Progress</span>
                  </span>
                )}
              </div>

              <h3
                onClick={() => onOpenDetail(item)}
                className="font-serif text-base font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2 cursor-pointer"
              >
                {item.title}
              </h3>

              <p className="text-xs text-brand-secondary font-medium line-clamp-1 mt-0.5">
                {mediaConfig.creatorPrefix}{item.creator}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-text-subtle font-mono mt-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mediaConfig.formatLength(item.lengthInfo)}
                </span>
              </div>

              {/* Genre pill tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {item.genres?.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-surface border border-theme-border text-text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-text-muted line-clamp-2 mt-3 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Primary Action Button Bar */}
        <div className="pt-4 mt-4 border-t border-theme-border-subtle flex flex-col gap-2">
          <button
            onClick={() => {
              fireCelebration();
              onMarkFinished(item);
            }}
            className="w-full py-2 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{mediaConfig.markVerb}</span>
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            {isInProgress ? (
              <button
                onClick={() => onStatusChange(item, "to_experience")}
                className="text-[11px] text-text-subtle hover:text-foreground transition-colors"
              >
                Move back to queue
              </button>
            ) : (
              <button
                onClick={() => onStatusChange(item, "in_progress")}
                className="text-[11px] text-brand-primary hover:underline font-medium flex items-center gap-1 transition-colors"
              >
                <Flame className="w-3 h-3 text-brand-secondary" />
                <span>{mediaConfig.startVerb}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDetail(item)}
                className="text-[11px] text-text-muted hover:text-foreground"
              >
                Details
              </button>

              <button
                onClick={() => onDeleteItem(item.id)}
                title="Remove from list"
                className="p-1 rounded-lg hover:bg-rose-500/10 text-text-subtle hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Top Banner & Queue Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-card border border-theme-border p-6 sm:p-8 shadow-theme-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-semibold mb-2">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Divided Curation Lists</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Watchlist & ReadList
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl leading-relaxed">
              Books and cinema queued for your personal experience. Structured into dedicated queues honoring their unique rhythms.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setListMode("readlist")}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                listMode === "readlist"
                  ? "bg-brand-primary text-brand-primary-fg border-brand-primary shadow-sm"
                  : "bg-surface border-theme-border text-foreground hover:bg-surface-card"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-0.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ReadList</span>
              </div>
              <span className="text-xl font-bold font-mono">{readListPending.length}</span>
              <span className="text-[10px] text-text-subtle block">books to read</span>
            </button>

            <button
              onClick={() => setListMode("watchlist")}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                listMode === "watchlist"
                  ? "bg-brand-primary text-brand-primary-fg border-brand-primary shadow-sm"
                  : "bg-surface border-theme-border text-foreground hover:bg-surface-card"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-0.5">
                <Film className="w-3.5 h-3.5" />
                <span>Watchlist</span>
              </div>
              <span className="text-xl font-bold font-mono">{watchListPending.length}</span>
              <span className="text-[10px] text-text-subtle block">films to watch</span>
            </button>

            {inProgressItems.length > 0 && (
              <div className="p-3.5 rounded-2xl border bg-surface border-theme-border text-foreground text-center">
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-0.5 text-brand-secondary">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>In Progress</span>
                </div>
                <span className="text-xl font-bold font-mono text-brand-secondary">{inProgressItems.length}</span>
                <span className="text-[10px] text-text-subtle block">currently active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Controller & Search Filter */}
      <div className="p-3.5 rounded-2xl bg-surface-card border border-theme-border flex flex-wrap items-center justify-between gap-3 shadow-theme-card">
        {/* Segmented Queue Modes */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-theme-border text-xs">
          <button
            onClick={() => setListMode("divided")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              listMode === "divided"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Divided Sections</span>
          </button>

          <button
            onClick={() => setListMode("readlist")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              listMode === "readlist"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ReadList ({readListPending.length})</span>
          </button>

          <button
            onClick={() => setListMode("watchlist")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              listMode === "watchlist"
                ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Watchlist ({watchListPending.length})</span>
          </button>
        </div>

        {/* Search within Queues */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search queued titles or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface border border-theme-border text-foreground placeholder-text-subtle text-xs focus:outline-none focus:border-brand-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 1. In-Progress Ribbon (If any titles are currently active) */}
      {filteredInProgress.length > 0 && (
        <section className="space-y-4 p-5 rounded-3xl bg-brand-secondary/5 border border-brand-secondary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-secondary animate-pulse" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              Currently Experiencing
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-secondary/15 text-brand-secondary font-mono font-bold">
              {filteredInProgress.length} active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInProgress.map(renderItemCard)}
          </div>
        </section>
      )}

      {/* 2. READLIST SECTION (Show in 'divided' or 'readlist' mode) */}
      {(listMode === "divided" || listMode === "readlist") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-theme-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  The ReadList
                </h2>
                <p className="text-xs text-text-muted">Books queued for intentional, sequential reading</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-theme-border text-text-muted font-mono">
                {filteredReadList.length} {filteredReadList.length === 1 ? "book" : "books"}
              </span>
              <button
                onClick={onNavigateToLibrary}
                className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1"
              >
                <span>Find Books</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredReadList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-surface-card border border-theme-border text-center space-y-3">
              <BookOpen className="w-10 h-10 text-text-subtle mx-auto opacity-50" />
              <h3 className="font-serif text-base font-bold text-foreground">
                Your ReadList is clear
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Discover new literary masterpieces in The Library to add to your reading queue.
              </p>
              <button
                onClick={onNavigateToLibrary}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-brand-primary-fg text-xs font-semibold shadow-sm transition-all hover:bg-brand-primary-hover"
              >
                <span>Explore The Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReadList.map(renderItemCard)}
            </div>
          )}
        </section>
      )}

      {/* 3. WATCHLIST SECTION (Show in 'divided' or 'watchlist' mode) */}
      {(listMode === "divided" || listMode === "watchlist") && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-6 border-t border-theme-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-secondary/10 text-brand-secondary">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  The Watchlist
                </h2>
                <p className="text-xs text-text-muted">Films, series, and anime waiting for cinema nights</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-theme-border text-text-muted font-mono">
                {filteredWatchList.length} {filteredWatchList.length === 1 ? "title" : "titles"}
              </span>
              <button
                onClick={onNavigateToTheatre}
                className="text-xs text-brand-secondary hover:underline font-medium flex items-center gap-1"
              >
                <span>Find Cinema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredWatchList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-surface-card border border-theme-border text-center space-y-3">
              <Film className="w-10 h-10 text-text-subtle mx-auto opacity-50" />
              <h3 className="font-serif text-base font-bold text-foreground">
                Your Watchlist is clear
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Explore captivating cinema, series, and anime in The Theater to queue up.
              </p>
              <button
                onClick={onNavigateToTheatre}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-secondary text-brand-secondary-fg text-xs font-semibold shadow-sm transition-all hover:opacity-90"
              >
                <span>Explore The Theater</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWatchList.map(renderItemCard)}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
