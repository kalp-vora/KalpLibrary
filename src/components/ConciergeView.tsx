"use client";

import { useState, useEffect, useMemo } from "react";
import { MediaItem } from "@/types";
import { StorageService } from "@/lib/storage";
import { getFirebaseInstance } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { NavTab } from "./Navbar";
import {
  GENRE_PROFILES,
  getMoodRecommendation,
  getDailyQuote,
  RecommendationResult,
  DailyQuote
} from "@/lib/recommendationEngine";
import { searchItemToMediaItem, SearchResultItem } from "@/lib/onlineResources";
import { getTimeGreeting } from "@/lib/timeHelpers";
import { copyToClipboard } from "@/lib/clipboard";
import { fireCelebration } from "@/lib/celebrate";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import {
  Compass,
  BookmarkPlus,
  CheckCircle2,
  Film,
  BookOpen,
  Quote,
  Copy,
  Sparkles,
  Check,
  Eye,
  ArrowRight
} from "lucide-react";

const ITEM_STATUS_TO_QUEUE_KEY: Record<MediaItem["status"], "wishlist" | "in_progress" | "finished"> = {
  to_experience: "wishlist",
  in_progress: "in_progress",
  finished: "finished",
};

interface ConciergeViewProps {
  items: MediaItem[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenReviewModal: (item: MediaItem) => void;
  onAddItem?: (item: MediaItem) => Promise<void>;
}

export const ConciergeView: React.FC<ConciergeViewProps> = ({
  items,
  onNavigateTab,
  onOpenReviewModal,
  onAddItem,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeGenreId, setActiveGenreId] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * GENRE_PROFILES.length);
    return GENRE_PROFILES[randomIndex]?.id || "scifi";
  });
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<Record<string, string>>({});

  // 1. Listen for current authenticated user
  useEffect(() => {
    try {
      const { auth } = getFirebaseInstance();
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
        });
        return () => unsubscribe();
      }
    } catch {
      // offline fallback
    }
  }, []);

  // 2. Timezone / Local Device Time greeting
  const [greetingTime, setGreetingTime] = useState<string>("day");
  useEffect(() => {
    setGreetingTime(getTimeGreeting(new Date().getHours()));
  }, []);

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Reader";

  // 3. Collection metrics
  const booksCount = items.filter((i) => i.type === "book").length;
  const moviesCount = items.filter((i) => i.type === "movie").length;
  const completedCount = items.filter((i) => i.status === "finished").length;

  // 4. Recommendation Engine Outputs
  const genreRecommendation: RecommendationResult = useMemo(() => {
    return getMoodRecommendation(activeGenreId, items);
  }, [activeGenreId, items]);

  const dailyQuote: DailyQuote = useMemo(() => {
    return getDailyQuote(items);
  }, [items]);

  // Check if an item is already in user's library
  const getItemStatus = (title: string): "wishlist" | "in_progress" | "finished" | null => {
    const existing = items.find(
      (i) => i.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    return existing ? ITEM_STATUS_TO_QUEUE_KEY[existing.status] || null : null;
  };

  // Action: Add to Wishlist / ReadList
  const handleAddToWishlist = async (searchItem: SearchResultItem) => {
    const existing = items.find(
      (i) => i.title.toLowerCase().trim() === searchItem.title.toLowerCase().trim()
    );
    if (existing) {
      setActionSuccess((prev) => ({
        ...prev,
        [searchItem.title]: `Already in your ${searchItem.type === "book" ? "ReadList" : "Watchlist"}`
      }));
      return;
    }

    const newItem = searchItemToMediaItem(searchItem, "to_experience");
    fireCelebration();
    if (onAddItem) {
      await onAddItem(newItem);
    } else {
      await StorageService.saveItem(newItem);
    }
    setActionSuccess((prev) => ({
      ...prev,
      [searchItem.title]: `Added to your ${searchItem.type === "book" ? "ReadList" : "Watchlist"}!`
    }));
  };

  // Action: Mark as Read or Watched
  const handleMarkAsCompleted = (searchItem: SearchResultItem) => {
    const existing = items.find(
      (i) => i.title.toLowerCase().trim() === searchItem.title.toLowerCase().trim()
    );
    const itemToReview = existing || searchItemToMediaItem(searchItem, "finished");
    onOpenReviewModal(itemToReview);
  };

  const handleCopyQuote = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      fireCelebration({ particleCount: 30, spread: 45 });
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-10 pb-12 animate-fade-in text-foreground">
      {/* 1. HERO SECTION: Local Device Time-Aware Greeting & Mood Question */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-card border border-theme-border p-6 sm:p-8 lg:p-10 shadow-lg">
        {/* Subtle Background Ambience */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Collection Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-theme-border text-xs font-medium text-text-muted">
              <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
              <span>{booksCount} Books</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-theme-border text-xs font-medium text-text-muted">
              <Film className="w-3.5 h-3.5 text-brand-secondary" />
              <span>{moviesCount} Movies</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-theme-border text-xs font-medium text-text-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{completedCount} in Journey</span>
            </span>
          </div>

          {/* Timezone Device Greeting */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Good {greetingTime}, <span className="text-brand-primary">{userName}</span>.
            </h1>
          </div>

          {/* "What's your mood?" Genre Selector */}
          <div className="pt-3 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-brand-secondary" />
              <label className="text-base sm:text-lg font-semibold uppercase tracking-wider text-brand-secondary font-mono">
                What&apos;s your mood?
              </label>
            </div>

            {/* Small Genre Tags */}
            <div className="flex flex-wrap gap-2.5">
              {GENRE_PROFILES.map((profile) => {
                const isActive = activeGenreId === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setActiveGenreId(profile.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 border active:scale-95 ${isActive
                      ? "bg-brand-primary text-brand-primary-fg border-brand-primary shadow-lg scale-105 font-semibold ring-2 ring-brand-primary/40"
                      : "bg-surface hover:bg-surface-card text-foreground border-theme-border hover:border-brand-secondary/40 hover:scale-[1.02]"
                      }`}
                  >
                    <span>{profile.icon}</span>
                    <span>{profile.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. GENRE RECOMMENDATIONS: 1 Movie & 1 Book */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Genre Pairing Recommendation
            </h2>
          </div>
          <span className="text-xs text-text-muted">
            Preferences checked against your wishlist first, then open discovery
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genre Book Recommendation */}
          <div className="bg-surface-card rounded-3xl border border-theme-border p-5 sm:p-6 shadow-md flex flex-col justify-between gap-5 transition-all duration-300 hover:border-brand-primary/40 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-36 h-52 shrink-0 rounded-md bg-surface border border-theme-border overflow-hidden shadow-md relative shimmer-overlay group">
                <BookCover
                  title={genreRecommendation.book.item.title}
                  creator={genreRecommendation.book.item.creator}
                  pages={genreRecommendation.book.item.lengthInfo?.pages}
                  releaseYear={genreRecommendation.book.item.releaseYear}
                  posterUrl={genreRecommendation.book.item.posterUrl}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-surface border border-theme-border text-brand-secondary">
                      {genreRecommendation.book.sourceType === "wishlist" ? "From ReadList" : "Open Discovery"}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      {genreRecommendation.book.item.releaseYear} &bull; {genreRecommendation.book.item.lengthInfo.pages || 320} Pages
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground line-clamp-1">
                    {genreRecommendation.book.item.title}
                  </h3>
                  <p className="text-xs text-brand-primary font-medium mt-0.5">
                    By {genreRecommendation.book.item.creator}
                  </p>

                  <p className="text-xs sm:text-sm text-text-muted mt-2 line-clamp-3 leading-relaxed">
                    {genreRecommendation.book.item.description}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {genreRecommendation.book.item.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-text-muted border border-theme-border"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {genreRecommendation.book.reason && (
                  <p className="text-[11px] text-text-subtle italic pt-1 border-t border-theme-border-subtle">
                    {genreRecommendation.book.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-theme-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToWishlist(genreRecommendation.book.item)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${getItemStatus(genreRecommendation.book.item.title) === "wishlist"
                    ? "bg-surface border border-theme-border text-text-muted"
                    : "bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg"
                    }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>
                    {getItemStatus(genreRecommendation.book.item.title) === "wishlist"
                      ? "In ReadList"
                      : "Add to ReadList"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkAsCompleted(genreRecommendation.book.item)}
                  className="px-3.5 py-1.5 bg-surface hover:bg-surface-card text-foreground border border-theme-border hover:border-brand-primary/50 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>
                    {getItemStatus(genreRecommendation.book.item.title) === "finished"
                      ? "Read Again"
                      : "Mark as Read"}
                  </span>
                </button>
              </div>

              {actionSuccess[genreRecommendation.book.item.title] && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {actionSuccess[genreRecommendation.book.item.title]}
                </span>
              )}
            </div>
          </div>

          {/* Genre Movie Recommendation */}
          <div className="bg-surface-card rounded-3xl border border-theme-border p-5 sm:p-6 shadow-md flex flex-col justify-between gap-5 transition-all duration-300 hover:border-brand-secondary/40 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-36 h-52 shrink-0 rounded-md bg-surface border border-theme-border overflow-hidden shadow-md relative shimmer-overlay group">
                <MovieCover
                  title={genreRecommendation.movie.item.title}
                  creator={genreRecommendation.movie.item.creator}
                  type={genreRecommendation.movie.item.type}
                  releaseYear={genreRecommendation.movie.item.releaseYear}
                  runtimeMinutes={genreRecommendation.movie.item.lengthInfo?.runtimeMinutes}
                  posterUrl={genreRecommendation.movie.item.posterUrl}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-surface border border-theme-border text-brand-secondary">
                      {genreRecommendation.movie.sourceType === "wishlist" ? "From Watchlist" : "Open Discovery"}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      {genreRecommendation.movie.item.releaseYear} &bull; {genreRecommendation.movie.item.lengthInfo.runtimeMinutes || 120} Mins
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground line-clamp-1">
                    {genreRecommendation.movie.item.title}
                  </h3>
                  <p className="text-xs text-brand-secondary font-medium mt-0.5">
                    Directed by {genreRecommendation.movie.item.creator}
                  </p>

                  <p className="text-xs sm:text-sm text-text-muted mt-2 line-clamp-3 leading-relaxed">
                    {genreRecommendation.movie.item.description}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {genreRecommendation.movie.item.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-text-muted border border-theme-border"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {genreRecommendation.movie.reason && (
                  <p className="text-[11px] text-text-subtle italic pt-1 border-t border-theme-border-subtle">
                    {genreRecommendation.movie.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-theme-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToWishlist(genreRecommendation.movie.item)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${getItemStatus(genreRecommendation.movie.item.title) === "wishlist"
                    ? "bg-surface border border-theme-border text-text-muted"
                    : "bg-brand-secondary hover:bg-brand-secondary-hover text-brand-secondary-fg"
                    }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>
                    {getItemStatus(genreRecommendation.movie.item.title) === "wishlist"
                      ? "In Watchlist"
                      : "Add to Watchlist"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkAsCompleted(genreRecommendation.movie.item)}
                  className="px-3.5 py-1.5 bg-surface hover:bg-surface-card text-foreground border border-theme-border hover:border-brand-secondary/50 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-secondary" />
                  <span>
                    {getItemStatus(genreRecommendation.movie.item.title) === "finished"
                      ? "Watched Again"
                      : "Mark as Watched"}
                  </span>
                </button>
              </div>

              {actionSuccess[genreRecommendation.movie.item.title] && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {actionSuccess[genreRecommendation.movie.item.title]}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DAILY QUOTE SECTION: Curated from User History or Open-Source Sources */}
      <section className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-md flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary font-mono">
                Daily Quote
              </span>
            </div>

            {dailyQuote.fromUserCollection && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface border border-theme-border text-brand-secondary font-mono font-medium">
                From Your Personal Collection
              </span>
            )}
          </div>

          <p className="font-serif text-lg sm:text-xl text-foreground italic font-normal leading-relaxed">
            &ldquo;{dailyQuote.quote}&rdquo;
          </p>
        </div>

        <div className="pt-4 border-t border-theme-border flex items-center justify-between">
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-brand-primary">{dailyQuote.author}</span>
            <span className="text-text-subtle"> &bull; </span>
            <span className="font-serif italic text-text-muted">{dailyQuote.work}</span>
            {dailyQuote.year && (
              <span className="text-text-subtle font-mono text-[11px]"> ({dailyQuote.year})</span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              handleCopyQuote(`“${dailyQuote.quote}” — ${dailyQuote.author}, ${dailyQuote.work}`)
            }
            className="p-2 rounded-xl bg-surface hover:bg-surface-card text-text-muted hover:text-foreground border border-theme-border transition-colors shadow-sm"
            title="Copy quote"
          >
            {copiedQuote ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* 4. EXPLORE COLLECTIONS SHORTCUTS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab("library")}
          className="p-5 rounded-2xl bg-surface-card hover:bg-surface border border-theme-border hover:border-brand-primary/50 text-left transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-foreground group-hover:text-brand-primary text-base">
                The Library
              </h4>
              <p className="text-xs text-text-muted">Explore and search all books in your catalog</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("theatre")}
          className="p-5 rounded-2xl bg-surface-card hover:bg-surface border border-theme-border hover:border-brand-secondary/50 text-left transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-brand-secondary/10 text-brand-secondary group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-foreground group-hover:text-brand-secondary text-base">
                The Theater
              </h4>
              <p className="text-xs text-text-muted">Explore and search cinema and series in your catalog</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
        </button>
      </section>
    </div>
  );
};
