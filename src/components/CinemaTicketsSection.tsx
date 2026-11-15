"use client";

import React, { useState } from "react";
import { MediaItem } from "@/types";
import {
  Film,
  Ticket,
  LayoutGrid,
  Star,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Trash2
} from "lucide-react";
import { TicketStub } from "@/components/TicketStub";
import { MovieCover } from "@/components/MovieCover";
import { fireCelebration } from "@/lib/celebrate";

interface CinemaTicketsSectionProps {
  movies: MediaItem[];
  onSelectMovie: (movie: MediaItem) => void;
  onOpenReview: (movie: MediaItem) => void;
  onUnmarkCompleted?: (movie: MediaItem) => void;
  onDeleteMovie?: (id: string) => void;
}

export const CinemaTicketsSection: React.FC<CinemaTicketsSectionProps> = ({
  movies,
  onSelectMovie,
  onOpenReview,
  onUnmarkCompleted,
  onDeleteMovie,
}) => {
  const [viewMode, setViewMode] = useState<"tickets" | "grid">("tickets");

  return (
    <section className="space-y-6">
      {/* Section Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                The Cinema Vault & Ticket Stubs
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Archived premiere passes and tickets for every completed film & series
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher: Ticket Stubs vs Simple Grid */}
        <div className="flex items-center bg-surface border border-theme-border p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode("tickets")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === "tickets"
                ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
            title="Display as collectible cinema ticket stubs"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Ticket Stubs</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-surface-card text-brand-primary font-bold shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
            title="Display as simple grid cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Simple Grid</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CINEMA TICKET STUBS */}
      {viewMode === "tickets" && (
        <div>
          {movies.length === 0 ? (
            <div className="p-16 rounded-3xl bg-surface-card border border-theme-border text-center">
              <Ticket className="w-14 h-14 text-amber-500/50 mx-auto mb-3 animate-pulse" />
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                Your Ticket Box is Empty
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Mark a movie or TV series from your Watchlist as watched. A commemorative cinema ticket pass will be printed and stamped here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {movies.map((movie) => (
                <TicketStub
                  key={movie.id}
                  item={movie}
                  onClick={() => {
                    fireCelebration({ particleCount: 25, spread: 45 });
                    onSelectMovie(movie);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: SIMPLE GRID VIEW */}
      {viewMode === "grid" && (
        <div>
          {movies.length === 0 ? (
            <div className="p-16 rounded-3xl bg-surface-card border border-theme-border text-center">
              <Film className="w-12 h-12 text-brand-secondary/40 mx-auto mb-3" />
              <p className="text-text-muted text-sm">No cinema items marked as watched yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-surface-card rounded-3xl border border-theme-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand-secondary/40 transition-all group"
                >
                  <div>
                    <div className="flex gap-4">
                      {/* Poster Thumbnail */}
                      <div
                        onClick={() => onSelectMovie(movie)}
                        className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden bg-surface border border-theme-border cursor-pointer shadow-md group-hover:scale-105 transition-transform"
                      >
                        <MovieCover
                          title={movie.title}
                          creator={movie.creator}
                          type={movie.type}
                          releaseYear={movie.releaseYear}
                          runtimeMinutes={movie.lengthInfo?.runtimeMinutes}
                          posterUrl={movie.posterUrl}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20">
                            {movie.type === "tv" ? "TV Series" : "Cinema"}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Watched
                          </span>
                        </div>

                        <h3
                          onClick={() => onSelectMovie(movie)}
                          className="font-serif text-base font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1 cursor-pointer"
                        >
                          {movie.title}
                        </h3>

                        <p className="text-xs text-brand-secondary font-medium line-clamp-1">
                          {movie.creator}
                        </p>

                        {/* Stars */}
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (movie.userRating || movie.review?.rating || 5)
                                  ? "fill-brand-secondary text-brand-secondary"
                                  : "text-text-muted/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reflection / Takeaways snippet */}
                    {movie.review?.takeaways && (
                      <div className="mt-3 p-3 rounded-2xl bg-surface border border-theme-border text-xs italic text-text-muted leading-relaxed">
                        &ldquo;{movie.review.takeaways}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-theme-border flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                    <span className="font-mono text-[11px]">
                      {movie.lengthInfo?.runtimeMinutes
                        ? `${movie.lengthInfo.runtimeMinutes} min`
                        : "Completed"}
                    </span>

                    <div className="flex items-center gap-2">
                      {onUnmarkCompleted && (
                        <button
                          type="button"
                          onClick={() => onUnmarkCompleted(movie)}
                          className="text-text-muted hover:text-amber-500 font-medium text-xs flex items-center gap-1 transition-colors"
                          title="Unmark as watched and return to Watchlist"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Unmark</span>
                        </button>
                      )}

                      {onDeleteMovie && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${movie.title}" from your library?`)) {
                              onDeleteMovie(movie.id);
                            }
                          }}
                          className="text-text-muted hover:text-rose-500 font-medium text-xs flex items-center gap-1 transition-colors"
                          title="Delete completely from library"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenReview(movie)}
                        className="text-brand-primary hover:text-brand-primary-hover font-semibold text-xs flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{movie.review?.takeaways ? "Journal" : "Add Reflections"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
