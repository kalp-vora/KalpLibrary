"use client";

import { useState, useEffect, useRef, useMemo, FormEvent, KeyboardEvent } from "react";
import { Search, X, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
import { MediaType } from "@/types";

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

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  isSearching = false,
  debounceMs = 500,
  suggestions = [],
  autoSearch = true,
  className = "",
}: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 500ms debounce on keystroke
  const debouncedValue = useDebounce(value, debounceMs);
  const lastSearchedRef = useRef<string>("");

  // Auto-search effect on 500ms debounce
  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (autoSearch && trimmed.length >= 2 && trimmed !== lastSearchedRef.current) {
      lastSearchedRef.current = trimmed;
      onSearch(trimmed);
    }
  }, [debouncedValue, autoSearch, onSearch]);

  // Only show suggestions based on active query, no recent search history
  const displayItems = useMemo<string[]>(() => {
    const q = value.trim().toLowerCase();
    // Do not show any dropdown when query is empty
    if (!q) return [];

    const seen = new Set<string>();
    const matched: string[] = [];

    for (const s of suggestions) {
      const lower = s.toLowerCase();
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower);
        matched.push(s);
      }
    }

    return matched.slice(0, 6);
  }, [value, suggestions]);

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
      handleSelectSuggestion(displayItems[highlightedIndex]);
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
        <Search className="w-4 h-4 text-text-subtle absolute left-4 pointer-events-none z-10 shrink-0" />

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
            if (value.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-11 pr-32 sm:pr-36 py-3 rounded-xl bg-surface border border-theme-border text-foreground placeholder-text-subtle text-xs sm:text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
        />

        {/* Right action group (Clear 'X' button + Submit 'Search' button) flex-aligned without overlapping */}
        <div className="absolute right-1.5 flex items-center gap-1.5 z-10">
          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-1.5 rounded-lg text-text-subtle hover:text-foreground hover:bg-surface-card transition-colors flex items-center justify-center shrink-0"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching || !value.trim()}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Search className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isSearching ? "Searching..." : "Search"}</span>
          </button>
        </div>
      </form>

      {/* Auto-Suggestion Dropdown (Filtered only by active search query) */}
      {isOpen && displayItems.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-card border border-theme-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in backdrop-blur-md">
          <div className="px-3 py-1.5 border-b border-theme-border-subtle flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-text-subtle">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-primary" />
              <span>Matching Suggestions</span>
            </span>
            <span>Press Enter ↵</span>
          </div>

          <div className="py-1 max-h-60 overflow-y-auto">
            {displayItems.map((text, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${text}-${idx}`}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelectSuggestion(text)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                    isHighlighted
                      ? "bg-brand-primary/10 text-brand-primary font-medium"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span className="truncate">{text}</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-text-subtle opacity-70 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
