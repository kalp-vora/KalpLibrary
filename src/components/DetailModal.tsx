"use client";

import { useState, useEffect, Fragment } from "react";
import { MediaItem, ItemStatus } from "@/types";
import { Star, Sparkles, Quote, Trash2, Edit3, X, CheckCircle2 } from "lucide-react";
import { getMediaConfig } from "@/lib/mediaConfig";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { BOOK_COVER_SWATCHES } from "@/lib/bookCoverTheme";
import { useModalDismiss } from "@/lib/useModalDismiss";

const STATUS_OPTIONS: Array<{ status: ItemStatus; label: string; title: string }> = [
  { status: "to_experience", label: "Queue", title: "To Experience" },
  { status: "in_progress", label: "Active", title: "In Progress" },
  { status: "finished", label: "Done", title: "Finished" },
];

interface DetailModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (item: MediaItem, newStatus: ItemStatus) => void;
  onOpenReview: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onColorChange?: (item: MediaItem, color: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onStatusChange,
  onOpenReview,
  onDelete,
  onColorChange,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(item?.spineStyle?.color || "");

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
  });

  useEffect(() => {
    if (item?.spineStyle?.color) {
      setSelectedColor(item.spineStyle.color);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const mediaConfig = getMediaConfig(item.type);
  const isBook = item.type === "book";

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    if (onColorChange) {
      onColorChange(item, color);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer select-none"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[min(90vh,800px)] overflow-y-auto overscroll-contain bg-surface-card text-foreground rounded-3xl border border-theme-border p-5 sm:p-8 shadow-2xl my-auto animate-fade-in-up cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-text-subtle hover:text-foreground p-2 rounded-xl hover:bg-surface border border-theme-border/50 transition-colors z-20 flex items-center gap-1 text-xs font-semibold"
        >
          <span>Close</span>
          <X className="w-4 h-4 ml-1" />
        </button>

        <div className="flex flex-col md:flex-row gap-7 items-start">
          {/* Left Column: 3D Hardcover Book / Media Poster */}
          <div className="w-full md:w-60 shrink-0 flex flex-col items-center">
            <div className="w-full max-w-[240px] aspect-[2/3] relative flex items-center justify-center">
              {isBook ? (
                <BookCover
                  title={item.title}
                  creator={item.creator}
                  pages={item.lengthInfo?.pages}
                  releaseYear={item.releaseYear}
                  posterUrl={item.posterUrl}
                  customColor={selectedColor || item.spineStyle?.color}
                  className="w-full h-full shadow-2xl"
                />
              ) : (
                <MovieCover
                  title={item.title}
                  creator={item.creator}
                  type={item.type}
                  releaseYear={item.releaseYear}
                  runtimeMinutes={item.lengthInfo?.runtimeMinutes}
                  posterUrl={item.posterUrl}
                  className="w-full h-full shadow-2xl"
                />
              )}
            </div>

            {/* Quick Status Control */}
            <div className="w-full max-w-[240px] mt-5 space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-text-subtle block text-center">
                {isBook ? "Reading Status" : "Viewing Status"}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-xl border border-theme-border">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => {
                      if (opt.status === "finished") {
                        onClose();
                        onOpenReview(item);
                      } else {
                        onStatusChange(item, opt.status);
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      item.status === opt.status
                        ? "bg-brand-primary text-brand-primary-fg font-semibold shadow-sm"
                        : "text-text-muted hover:text-foreground"
                    }`}
                    title={opt.title}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Journal / Takeaways Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReview(item);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-surface hover:bg-surface-card text-brand-primary border border-theme-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{item.review ? "Edit Thoughts & Takeaways" : "Write Completion Thoughts"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Overview matching Reference Layout */}
          <div className="flex-1 space-y-4 w-full">
            {/* Breadcrumb: Type • Genres */}
            <div className="text-xs text-text-muted font-medium flex items-center gap-1.5 flex-wrap">
              <span className="capitalize">{mediaConfig.label}</span>
              {item.genres?.slice(0, 3).map((g) => (
                <Fragment key={g}>
                  <span>•</span>
                  <span>{g}</span>
                </Fragment>
              ))}
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {item.title}
              </h1>
              <p className="text-sm text-text-muted italic mt-1">
                by <span className="font-semibold text-foreground not-italic">{item.creator}</span>
              </p>
            </div>

            {/* Quick Metrics Badges (Length, Year, Rating) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-surface border border-theme-border text-text-muted font-medium">
                Length <strong className="text-foreground">{mediaConfig.formatLength(item.lengthInfo)}</strong>
              </span>

              {item.releaseYear && (
                <span className="text-xs px-3 py-1.5 rounded-xl bg-surface border border-theme-border text-text-muted font-medium">
                  Year <strong className="text-foreground">{item.releaseYear}</strong>
                </span>
              )}

              {(item.userRating || item.criticRating) && (
                <span className="text-xs px-3 py-1.5 rounded-xl bg-surface border border-theme-border text-brand-primary font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-brand-primary" />
                  <span>Rated <strong className="text-foreground">{item.userRating ? `${item.userRating}/5` : `${item.criticRating}/10`}</strong></span>
                </span>
              )}
            </div>

            {/* Synopsis / Description */}
            <div className="pt-2">
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Mood Tags */}
            {item.moodTags && item.moodTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.moodTags.map((tag) => (
                  <span
                    key={tag}
                    className="font-serif italic text-xs text-text-muted/90"
                  >
                    {tag.toLowerCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Big Primary Action: Finished this */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onStatusChange(item, item.status === "finished" ? "to_experience" : "finished")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${
                  item.status === "finished"
                    ? "bg-emerald-600/20 text-emerald-500 border border-emerald-500/30"
                    : "bg-[#D95D39] hover:bg-[#C4502E] text-white"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{item.status === "finished" ? "Finished this ✓" : "I finished this"}</span>
              </button>
            </div>

            {/* Colour Swatches (for Books, matching reference image) */}
            {isBook && (
              <div className="pt-3 border-t border-theme-border-subtle space-y-2">
                <label className="text-[11px] font-semibold text-text-muted block">
                  Colour
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {BOOK_COVER_SWATCHES.map((swatch) => {
                    const isCurrent =
                      (selectedColor || item.spineStyle?.color || "#13382C").toLowerCase() ===
                      swatch.color.toLowerCase();
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        onClick={() => handleSelectColor(swatch.color)}
                        title={swatch.name}
                        style={{ backgroundColor: swatch.color }}
                        className={`w-6 h-6 rounded-full transition-all border ${
                          isCurrent
                            ? "ring-2 ring-brand-primary ring-offset-2 scale-110 border-white/40 shadow-sm"
                            : "border-black/20 hover:scale-105 opacity-90 hover:opacity-100"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reflections if Finished */}
            {item.review && (
              <div className="p-4 rounded-2xl bg-surface border border-theme-border space-y-2 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  My Reflections
                </span>
                {item.review.takeaways && (
                  <p className="text-xs text-foreground italic">
                    &ldquo;{item.review.takeaways}&rdquo;
                  </p>
                )}
                {item.review.favoriteQuote && (
                  <div className="pt-1.5 border-t border-theme-border-subtle flex items-start gap-1.5 text-xs text-foreground font-serif italic">
                    <Quote className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                    <p>{item.review.favoriteQuote}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Secondary Links (Edit details / Remove from shelf) */}
            <div className="pt-4 border-t border-theme-border-subtle flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReview(item);
                }}
                className="text-text-muted hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Edit details
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${item.title}" from your library?`)) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className="text-text-muted hover:text-rose-500 underline underline-offset-4 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove from shelf</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
