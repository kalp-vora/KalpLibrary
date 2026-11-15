"use client";

import { Heart } from "lucide-react";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`w-full py-4 px-4 text-center shrink-0 z-10 border-t border-theme-border-subtle mt-auto bg-transparent ${className}`}
    >
      <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium tracking-wide text-brand-primary">
        <span>Developed by KalpVruksh</span>
        <span className="text-text-subtle">•</span>
        <span className="font-serif italic text-foreground">Kalp Vora</span>
        <span className="text-text-subtle">•</span>
        <span className="inline-flex items-center gap-1 text-brand-primary">
          Made with love <Heart className="w-3.5 h-3.5 fill-current" />
        </span>
      </div>
    </footer>
  );
};

