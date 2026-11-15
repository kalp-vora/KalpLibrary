"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MediaItem, MoodMatchResult } from "@/types";
import { Sparkles, RefreshCw, Flame, ArrowRight, X } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { MovieCover } from "@/components/MovieCover";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface MoodMatcherModalProps {
  items: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAndStart: (item: MediaItem) => void;
  onOpenDetail: (item: MediaItem) => void;
}

export const MoodMatcherModal: React.FC<MoodMatcherModalProps> = ({
  items,
  isOpen,
  onClose,
  onSelectAndStart,
  onOpenDetail
}) => {
  const [moodDescription, setMoodDescription] = useState("");
  const [result, setResult] = useState<MoodMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
  });

  const moodMutation = useMutation({
    mutationFn: async (textToSearch: string) => {
      const res = await fetch("/api/mood-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodDescription: textToSearch.trim(),
          items
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to find match");
      }
      return data.result as MoodMatchResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to find a match. Try describing your mood with different words.");
    }
  });

  const isMatching = moodMutation.isPending;

  if (!isOpen) return null;

  const quickMoodPresets = [
    { label: "Exhausted & Need Wholesome Comfort", icon: "🛋️", text: "I've had a long exhausting day, need something cozy, warm, and uplifting that doesn't demand too much mental energy." },
    { label: "Mind-Bending & Existential", icon: "🌌", text: "In the mood for a cerebral, mind-bending puzzle that makes me question reality and think deeply." },
    { label: "Edge of My Seat Suspense", icon: "⚡", text: "Looking for gripping suspense, high stakes, and fast pacing that keeps me completely glued." },
    { label: "Cosmic Awe & Grand Adventure", icon: "🚀", text: "Want an epic, awe-inspiring journey through space or vast worlds with great scale." },
    { label: "Inspiring & Motivating", icon: "💡", text: "Feeling ambitious and want actionable insights or a story that motivates me to build and grow." },
    { label: "Tender, Poignant & Emotional", icon: "🥹", text: "Quiet evening, looking for a poignant, heartfelt meditation on love, destiny, and the roads not taken." }
  ];

  const handleMatch = async (customMood?: string) => {
    const textToSearch = customMood || moodDescription;
    if (!textToSearch.trim()) return;

    setError(null);
    setResult(null);
    await moodMutation.mutateAsync(textToSearch);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer select-none"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[min(90vh,760px)] overflow-y-auto overscroll-contain bg-surface-card rounded-3xl border border-theme-border p-5 sm:p-8 shadow-2xl my-auto text-foreground animate-fade-in-up cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <Sparkles className="w-6 h-6 text-brand-primary animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-brand-secondary font-semibold block">
                Atmospheric Compass
              </span>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                What are you in the mood for?
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

        {/* Input prompt */}
        {!result && (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Describe your current mood, energy level, or ideal vibe:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. It's raining outside, I'm feeling thoughtful and want a story with quiet depth and beautiful prose..."
                value={moodDescription}
                onChange={(e) => setMoodDescription(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-surface border border-theme-border text-foreground placeholder:text-text-subtle text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2.5">
                Or pick a quick vibe:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickMoodPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMoodDescription(preset.text);
                      handleMatch(preset.text);
                    }}
                    className="p-3 rounded-xl bg-surface hover:bg-surface-card border border-theme-border hover:border-brand-secondary/50 text-left transition-all group flex items-start gap-2.5"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {preset.icon}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-brand-primary block">
                        {preset.label}
                      </span>
                      <span className="text-[11px] text-text-muted line-clamp-1">
                        {preset.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-500 text-xs">
                {error}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => handleMatch()}
              disabled={isMatching || !moodDescription.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-brand-primary-fg font-bold text-sm shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consulting your personal collection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Reveal My Best Match</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Match Reveal */}
        {result && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {/* Top Match Card */}
            <div className="relative overflow-hidden p-6 rounded-3xl bg-surface border border-theme-border shadow-lg">
              <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>{result.matchScore}% Mood Affinity</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start mt-2">
                <div className="w-32 h-44 rounded-md overflow-hidden shadow-xl border border-theme-border flex-shrink-0 relative">
                  {result.recommendedItem.type === "book" ? (
                    <BookCover
                      title={result.recommendedItem.title}
                      creator={result.recommendedItem.creator}
                      pages={result.recommendedItem.lengthInfo?.pages}
                      releaseYear={result.recommendedItem.releaseYear}
                      posterUrl={result.recommendedItem.posterUrl}
                      customColor={result.recommendedItem.spineStyle?.color}
                      className="w-full h-full"
                    />
                  ) : (
                    <MovieCover
                      title={result.recommendedItem.title}
                      creator={result.recommendedItem.creator}
                      type={result.recommendedItem.type}
                      releaseYear={result.recommendedItem.releaseYear}
                      runtimeMinutes={result.recommendedItem.lengthInfo?.runtimeMinutes}
                      posterUrl={result.recommendedItem.posterUrl}
                      className="w-full h-full"
                    />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-primary font-semibold px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20">
                    Top Recommendation
                  </span>

                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    {result.recommendedItem.title}
                  </h3>
                  <p className="text-xs text-brand-secondary font-medium">
                    {result.recommendedItem.creator} &bull; {result.recommendedItem.releaseYear}
                  </p>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {result.recommendedItem.description}
                  </p>

                  {/* Mood Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.recommendedItem.moodTags?.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-card text-brand-primary border border-theme-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rationale Pitch */}
              <div className="mt-5 p-4 rounded-2xl bg-surface-card border border-theme-border space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-brand-primary font-semibold block">
                  Why this fits your mood right now:
                </span>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                  &ldquo;{result.pitch}&rdquo;
                </p>
                {result.whyRightNow && (
                  <p className="text-xs text-text-muted pt-2 border-t border-theme-border">
                    <span className="text-brand-secondary font-medium">Rhythm match: </span>
                    {result.whyRightNow}
                  </p>
                )}
              </div>
            </div>

            {/* Alternative if available */}
            {result.alternativeItem && (
              <div
                onClick={() => onOpenDetail(result.alternativeItem!)}
                className="p-3.5 rounded-2xl bg-surface hover:bg-surface-card border border-theme-border flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-14 rounded-sm overflow-hidden flex-shrink-0 relative">
                    {result.alternativeItem.type === "book" ? (
                      <BookCover
                        title={result.alternativeItem.title}
                        creator={result.alternativeItem.creator}
                        pages={result.alternativeItem.lengthInfo?.pages}
                        releaseYear={result.alternativeItem.releaseYear}
                        posterUrl={result.alternativeItem.posterUrl}
                        customColor={result.alternativeItem.spineStyle?.color}
                        className="w-full h-full"
                      />
                    ) : (
                      <MovieCover
                        title={result.alternativeItem.title}
                        creator={result.alternativeItem.creator}
                        type={result.alternativeItem.type}
                        releaseYear={result.alternativeItem.releaseYear}
                        runtimeMinutes={result.alternativeItem.lengthInfo?.runtimeMinutes}
                        posterUrl={result.alternativeItem.posterUrl}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-mono">Alternative option</span>
                    <h5 className="font-serif font-bold text-xs text-foreground">{result.alternativeItem.title}</h5>
                    <span className="text-[10px] text-brand-secondary font-medium">{result.alternativeItem.creator}</span>
                  </div>
                </div>
                <span className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-semibold">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-theme-border flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  setMoodDescription("");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-foreground hover:bg-surface transition-colors"
              >
                &larr; Describe Another Mood
              </button>

              <button
                onClick={() => {
                  onSelectAndStart(result.recommendedItem);
                  onClose();
                }}
                className="py-2.5 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg font-bold text-sm shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>Start {result.recommendedItem.type === "book" ? "Reading" : "Watching"} Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
