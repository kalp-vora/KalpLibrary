"use client";

import { MediaItem, ItemStatus, MediaType } from "@/types";
import { BookOpen, Film, Tv, Star, Clock, CheckCircle2, Bookmark, Flame, Edit3, MessageSquareQuote } from "lucide-react";
import { getMediaConfig, getStatusConfig } from "@/lib/mediaConfig";
import { fireCelebration } from "@/lib/celebrate";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";

const MEDIA_TYPE_ICONS: Record<MediaType, React.ReactNode> = {
  book: <BookOpen className="w-3.5 h-3.5 text-brand-primary" />,
  movie: <Film className="w-3.5 h-3.5 text-brand-secondary" />,
  tv: <Tv className="w-3.5 h-3.5 text-brand-secondary" />,
  anime: <Film className="w-3.5 h-3.5 text-brand-secondary" />,
};

const STATUS_ICONS: Record<ItemStatus, React.ReactNode> = {
  to_experience: <Bookmark className="w-3 h-3 text-text-muted" />,
  in_progress: <Flame className="w-3 h-3 text-brand-secondary animate-pulse" />,
  finished: <CheckCircle2 className="w-3 h-3" />,
};

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onStatusChange: (item: MediaItem, newStatus: ItemStatus) => void;
  onOpenReview: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  onStatusChange,
  onOpenReview
}) => {
  const isFinished = item.status === "finished";
  const hasReview = Boolean(item.review && (item.review.thoughts || item.review.takeaways));
  const mediaConfig = getMediaConfig(item.type);
  const statusConfig = getStatusConfig(item.status);

  return (
    <div className="group relative bg-surface-card hover:bg-surface rounded-2xl border border-theme-border hover:border-brand-primary/40 transition-all duration-300 flex flex-col overflow-hidden shadow-theme-card hover:shadow-2xl hover:-translate-y-1.5 animate-fade-in-up">
      {/* Top Banner / Poster Container with Shimmer Hover */}
      <div 
        onClick={() => onSelect(item)} 
        className="relative h-48 w-full overflow-hidden cursor-pointer bg-surface shimmer-overlay"
      >
        {item.type === "book" ? (
          <BookCover
            title={item.title}
            creator={item.creator}
            pages={item.lengthInfo?.pages}
            releaseYear={item.releaseYear}
            posterUrl={item.posterUrl}
            customColor={item.spineStyle?.color}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <MovieCover
            title={item.title}
            creator={item.creator}
            type={item.type}
            releaseYear={item.releaseYear}
            runtimeMinutes={item.lengthInfo?.runtimeMinutes}
            posterUrl={item.posterUrl}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/40" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md bg-surface/90 text-text-main border border-theme-border shadow-sm">
            {MEDIA_TYPE_ICONS[item.type] || MEDIA_TYPE_ICONS.movie}
            <span className="capitalize">{mediaConfig.label}</span>
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusConfig.badgeClass}`}>
              {STATUS_ICONS[item.status]}
              {statusConfig.getQueueLabel(item.type)}
            </span>
          </div>
        </div>

        {/* Bottom Poster Info (Runtime/Pages & Rating) */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1 text-[11px] bg-black/60 text-white backdrop-blur-sm px-2 py-0.5 rounded-md font-mono">
            <Clock className="w-3 h-3 text-text-subtle" />
            {mediaConfig.formatLength(item.lengthInfo)}
          </span>

          {item.userRating ? (
            <div className="flex items-center gap-1 bg-brand-primary/20 text-brand-primary border border-brand-primary/40 px-2 py-0.5 rounded-md font-semibold text-[11px] backdrop-blur-sm">
              <Star className="w-3 h-3 fill-current text-brand-primary" />
              <span>{item.userRating}/5</span>
            </div>
          ) : item.criticRating ? (
            <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded-md text-[11px] font-mono backdrop-blur-sm">
              <Star className="w-3 h-3 text-brand-secondary" />
              <span>{item.criticRating}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div onClick={() => onSelect(item)} className="cursor-pointer">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-serif text-base font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1">
              {item.title}
            </h3>
            <span className="text-xs text-text-subtle font-mono shrink-0">
              {item.releaseYear}
            </span>
          </div>

          <p className="text-xs font-semibold text-brand-secondary mb-2 line-clamp-1">
            {item.creator}
          </p>

          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-text-muted border border-theme-border font-medium"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* User Review / Takeaways Preview if Finished */}
          {isFinished && hasReview && (
            <div className="mb-3 p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-[11px] text-brand-primary italic flex items-start gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
              <p className="line-clamp-2">
                &ldquo;{item.review?.takeaways || item.review?.thoughts}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-theme-border-subtle flex items-center justify-between gap-2">
          {/* Status Quick Toggle */}
          <select
            value={item.status}
            onChange={(e) => {
              const val = e.target.value as ItemStatus;
              if (val === "finished") {
                onOpenReview(item);
              } else {
                onStatusChange(item, val);
              }
            }}
            className="text-xs bg-surface border border-theme-border text-foreground rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-primary shadow-sm"
          >
            <option value="to_experience">To {mediaConfig.verb}</option>
            <option value="in_progress">In Progress</option>
            <option value="finished">Completed</option>
          </select>

          {/* Action Button: Mark as Read / Watched or View Thoughts */}
          {isFinished ? (
            <button
              onClick={() => onOpenReview(item)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-surface-card text-brand-primary border border-theme-border transition-all shadow-sm"
              title="Read or edit thoughts & takeaways"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasReview ? "Thoughts" : "Add Note"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                fireCelebration();
                onOpenReview(item);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg shadow-sm transition-all active:scale-95"
              title={`Mark ${mediaConfig.label} as ${mediaConfig.markVerb} and leave thoughts`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{mediaConfig.markVerb}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
