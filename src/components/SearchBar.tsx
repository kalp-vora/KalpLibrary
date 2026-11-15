"use client";

import { useState, useEffect, useRef, useMemo, FormEvent, KeyboardEvent } from "react";
import { Search, X, Loader2, Sparkles, ArrowRight, Clock } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
import { MediaType } from "@/types";
import { getRecentSearchQueries } from "@/lib/searchHistory";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  type?: MediaType;
  placeholder?: string;
  isSearching?: boolean;
  debounceMs?: number;
  suggestions?: string[];
  autoSearch?: boolean;
  className?: string;
}

interface SuggestionItem {
  text: string;
  isRecent: boolean;
}

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  type,
  placeholder = "Search...",
  isSearching = false,
  debounceMs = 500,
  suggestions = [],
  autoSearch = true,
  className = "",
}: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 500ms debounce on keystroke
  const debouncedValue = useDebounce(value, debounceMs);
  const lastSearchedRef = useRef<string>("");

  // Sync recent searches on open or type change
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRecentQueries(getRecentSearchQueries(type, 5));
    }
  }, [type, isOpen]);

  // Auto-search effect on 500ms debounce
  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (autoSearch && trimmed.length >= 2 && trimmed !== lastSearchedRef.current) {
      lastSearchedRef.current = trimmed;
      onSearch(trimmed);
    }
  }, [debouncedValue, autoSearch, onSearch]);

  // Filter matching suggestions combining recent searches and candidate samples
  const displayItems = useMemo<SuggestionItem[]>(() => {
    const q = value.trim().toLowerCase();
    const items: SuggestionItem[] = [];
    const seen = new Set<string>();

    if (!q) {
      // Unfocused or empty query: show recent searches first, then top sample suggestions
      for (const rq of recentQueries) {
        const lower = rq.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          items.push({ text: rq, isRecent: true });
        }
      }
      for (const s of suggestions.slice(0, 4)) {
        const lower = s.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          items.push({ text: s, isRecent: false });
        }
      }
      return items.slice(0, 6);
    }

    // When typing: match recent queries first, then catalog suggestions
    for (const rq of recentQueries) {
      if (rq.toLowerCase().includes(q) && !seen.has(rq.toLowerCase())) {
        seen.add(rq.toLowerCase());
        items.push({ text: rq, isRecent: true });
      }
    }

    for (const s of suggestions) {
      const lower = s.toLowerCase();
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower);
        items.push({ text: s, isRecent: false });
      }
    }

    return items.slice(0, 7);
  }, [value, recentQueries, suggestions]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    lastSearchedRef.current = q;
    setIsOpen(false);
    onSearch(q);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    lastSearchedRef.current = suggestion;
    setIsOpen(false);
    onSearch(suggestion);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || displayItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < displayItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : displayItems.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(displayItems[highlightedIndex].text);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange("");
    lastSearchedRef.current = "";
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Left search icon */}
        <Search className="w-4 h-4 text-text-subtle absolute left-4 pointer-events-none z-10" />

        {/* Search input field with auto-suggest */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-11 pr-28 py-3 rounded-xl bg-surface border border-theme-border text-foreground placeholder-text-subtle text-xs sm:text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
        />

        {/* Clear button if text entered */}
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 p-1 rounded-full text-text-subtle hover:text-foreground hover:bg-surface-card transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search submit button with loading state */}
        <button
          type="submit"
          disabled={isSearching || !value.trim()}
          className="absolute right-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span>{isSearching ? "Searching..." : "Search"}</span>
        </button>
      </form>

      {/* Auto-Suggestion Dropdown */}
      {isOpen && displayItems.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-card border border-theme-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in backdrop-blur-md">
          <div className="px-3 py-1.5 border-b border-theme-border-subtle flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-text-subtle">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-primary" />
              <span>Suggestions & History</span>
            </span>
            <span>Press Enter ↵</span>
          </div>

          <div className="py-1 max-h-60 overflow-y-auto">
            {displayItems.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${item.text}-${idx}`}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelectSuggestion(item.text)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${isHighlighted
                      ? "bg-brand-primary/10 text-brand-primary font-medium"
                      : "text-foreground hover:bg-surface"
                    }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {item.isRecent ? (
                      <Clock className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                    ) : (
                      <Search className="w-3 h-3 text-text-subtle shrink-0" />
                    )}
                    <span className="truncate">{item.text}</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.isRecent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-theme-border font-mono text-brand-secondary">
                        Recent
                      </span>
                    )}
                    <ArrowRight className="w-3 h-3 text-text-subtle opacity-70" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
