"use client";

import { useState, useEffect } from "react";
import { MediaItem, ReviewData } from "@/types";
import { Star, Sparkles, Trophy, Quote, Check, X } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { fireCelebration, fireMajorCelebration } from "@/lib/celebrate";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface ReviewModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReview: (item: MediaItem, review: ReviewData) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveReview,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [finishedDate, setFinishedDate] = useState("");
  const [takeaways, setTakeaways] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [wouldRecommendTo, setWouldRecommendTo] = useState("");

  // Dismiss on ESC key, outside backdrop click/touch, and lock background scroll
  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
  });

  useEffect(() => {
    if (item && isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setRating(item.review?.rating || item.userRating || 5);
      setFinishedDate(item.review?.finishedDate || today);
      setTakeaways(item.review?.takeaways || "");
      setThoughts(item.review?.thoughts || "");
      setFavoriteQuote(item.review?.favoriteQuote || "");
      setWouldRecommendTo(item.review?.wouldRecommendTo || "");

      // Fire gentle celebratory confetti
      fireCelebration();
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isBook = item.type === "book";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData: ReviewData = {
      finishedDate: finishedDate || new Date().toISOString().split("T")[0],
      rating,
      takeaways: takeaways.trim(),
      thoughts: thoughts.trim(),
      favoriteQuote: favoriteQuote.trim() || undefined,
      wouldRecommendTo: wouldRecommendTo.trim() || undefined,
    };

    // Confetti burst on completion
    fireMajorCelebration();

    onSaveReview(item, reviewData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer select-none"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg md:max-w-xl max-h-[min(90vh,740px)] bg-surface-card rounded-3xl border border-theme-border shadow-2xl flex flex-col text-foreground animate-fade-in-up cursor-default overflow-hidden my-auto select-text"
      >
        {/* Fixed Header with Always-Visible Close Button */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-theme-border shrink-0 bg-surface-card">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-brand-secondary font-semibold block truncate">
                {isBook ? "Reading Complete" : "Screening Complete"}
              </span>
              <h2
                id="review-modal-title"
                className="font-serif text-base sm:text-xl font-bold text-foreground truncate"
              >
                You Finished &ldquo;{item.title}&rdquo;!
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 sm:p-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-theme-border text-text-muted hover:text-foreground transition-all shrink-0 active:scale-95 flex items-center justify-center min-w-[38px] min-h-[38px]"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          {/* Item mini header */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-surface border border-theme-border flex items-center gap-3">
            <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg overflow-hidden shadow-sm shrink-0">
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
            <div className="flex-1 min-w-0">
              <h4 className="font-serif font-bold text-sm text-foreground truncate">
                {item.title}
              </h4>
              <p className="text-xs text-brand-secondary truncate font-medium">
                {item.creator} &bull; {item.releaseYear}
              </p>
              <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider block truncate">
                {isBook
                  ? "Ready to take its place on your lifelong shelf"
                  : "Ready to take its place in your cinema vault"}
              </span>
            </div>
          </div>

          {/* Rating and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Star Rating */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-surface border border-theme-border">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-125 transition-transform"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                        star <= (hoverRating ?? rating)
                          ? "fill-brand-secondary text-brand-secondary"
                          : "text-text-muted/40"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs sm:text-sm font-bold font-mono text-brand-secondary ml-1.5">
                  {hoverRating ?? rating}/5
                </span>
              </div>
            </div>

            {/* Date Completed */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-surface border border-theme-border">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Date Completed
              </label>
              <input
                type="date"
                value={finishedDate}
                onChange={(e) => setFinishedDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-card border border-theme-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Key Takeaways and Life Lessons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-primary mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>
                {isBook ? "Key Takeaways & Life Lessons" : "Key Takeaways & Cinematic Highlights"}
              </span>
            </label>
            <textarea
              rows={2}
              placeholder={
                isBook
                  ? "What ideas, wisdom, or life lessons will stick with you?"
                  : "What cinematic moments, themes, or performances stood out to you?"
              }
              value={takeaways}
              onChange={(e) => setTakeaways(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-xs sm:text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-y min-h-[60px]"
            />
          </div>

          {/* What are your thoughts about it? */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
              {isBook ? "What are your thoughts about this book?" : "What are your thoughts on this film or show?"}
            </label>
            <textarea
              rows={2}
              placeholder={
                isBook
                  ? "How did this book make you feel? Share your personal review and reflections..."
                  : "How did this film make you feel? Share your personal review and reflections..."
              }
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-xs sm:text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-y min-h-[60px]"
            />
          </div>

          {/* Favorite Quote / Memorable Line */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
              <span>{isBook ? "Favorite Quote or Passage" : "Memorable Quote or Scene"}</span>
            </label>
            <input
              type="text"
              placeholder={
                isBook
                  ? "e.g. A memorable line or passage that resonated with you"
                  : "e.g. A memorable line, iconic quote, or memorable scene"
              }
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-xs sm:text-sm focus:outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* Fixed Action Footer */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-theme-border flex items-center justify-between gap-3 shrink-0 bg-surface-card">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-text-muted hover:text-foreground hover:bg-surface transition-colors active:scale-95"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="py-2 px-5 sm:px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg font-bold text-xs sm:text-sm shadow-md shadow-brand-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isBook ? "Save & Place on Shelf" : "Save & Add Ticket to Vault"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
