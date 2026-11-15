"use client";

import { useState, useEffect } from "react";
import { MediaItem, ReviewData } from "@/types";
import { Star, Sparkles, Trophy, Quote, Check, X } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { fireCelebration, fireMajorCelebration } from "@/lib/celebrate";

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
  onSaveReview
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [finishedDate, setFinishedDate] = useState("");
  const [takeaways, setTakeaways] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [wouldRecommendTo, setWouldRecommendTo] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData: ReviewData = {
      finishedDate: finishedDate || new Date().toISOString().split("T")[0],
      rating,
      takeaways: takeaways.trim(),
      thoughts: thoughts.trim(),
      favoriteQuote: favoriteQuote.trim() || undefined,
      wouldRecommendTo: wouldRecommendTo.trim() || undefined
    };

    // Confetti burst on completion
    fireMajorCelebration();

    onSaveReview(item, reviewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-card rounded-3xl border border-theme-border p-6 sm:p-8 shadow-2xl my-8 text-foreground animate-fade-in-up">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <Trophy className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-brand-secondary font-semibold block">
                Congratulations
              </span>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                You Finished &ldquo;{item.title}&rdquo;!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-foreground p-2 rounded-full hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item mini header */}
        <div className="my-5 p-3.5 rounded-2xl bg-surface border border-theme-border flex items-center gap-3.5">
          <div className="w-12 h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0">
            {item.type === "book" ? (
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
          <div className="flex-1 overflow-hidden">
            <h4 className="font-serif font-bold text-sm text-foreground truncate">
              {item.title}
            </h4>
            <p className="text-xs text-brand-secondary truncate font-medium">
              {item.creator} &bull; {item.releaseYear}
            </p>
            <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">
              Ready to take its place on your lifelong shelf
            </span>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Star Rating */}
            <div className="p-4 rounded-2xl bg-surface border border-theme-border">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating ?? rating)
                          ? "fill-brand-secondary text-brand-secondary"
                          : "text-text-muted/40"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold font-mono text-brand-secondary ml-2">
                  {hoverRating ?? rating}/5 Stars
                </span>
              </div>
            </div>

            {/* Date Completed */}
            <div className="p-4 rounded-2xl bg-surface border border-theme-border">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Date Completed
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={finishedDate}
                  onChange={(e) => setFinishedDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-card border border-theme-border text-foreground text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Key Takeaways and Life Lessons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-primary mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Key Takeaways & Life Lessons
            </label>
            <textarea
              rows={3}
              placeholder="What ideas or moments will stick with you?"
              value={takeaways}
              onChange={(e) => setTakeaways(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* What are your thoughts about it? */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              What are your thoughts about it?
            </label>
            <textarea
              rows={3}
              placeholder="How did this work make you feel? Share your personal review and impressions..."
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Favorite Quote / Memorable Line */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-brand-secondary" />
              Favorite Quote or Scene
            </label>
            <input
              type="text"
              placeholder="e.g. A memorable line or scene that resonated with you"
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-theme-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg font-bold text-sm shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Place on Shelf</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
