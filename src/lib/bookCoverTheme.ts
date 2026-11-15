/**
 * Deterministic color palettes, swatch definitions, and helper utilities
 * for solid-color physical hardcover book covers matching editorial references.
 */

export interface BookCoverPalette {
  id: string;
  color: string;
  foilColor: string;
  bg: string;
  border: string;
  accent: string;
  text: string;
  subtext: string;
}

export interface BookCoverSwatch {
  id: string;
  name: string;
  color: string;
}

export const BOOK_COVER_SWATCHES: BookCoverSwatch[] = [
  { id: "spruce", name: "Spruce Green", color: "#13382C" },
  { id: "navy", name: "Oxford Navy", color: "#17305C" },
  { id: "terracotta", name: "Terracotta", color: "#C45B34" },
  { id: "crimson", name: "Imperial Crimson", color: "#8E2832" },
  { id: "amber", name: "Warm Amber", color: "#C96D23" },
  { id: "gold", name: "Mustard Gold", color: "#C69214" },
  { id: "teal", name: "Deep Teal", color: "#176966" },
  { id: "slate", name: "Slate Blue", color: "#2B527A" },
  { id: "purple", name: "Royal Purple", color: "#4F2A68" },
  { id: "rose", name: "Dusty Rose", color: "#873B53" },
  { id: "cream", name: "Warm Cream", color: "#EAE2D1" },
  { id: "charcoal", name: "Charcoal Onyx", color: "#181A1B" },
];

export const BOOK_COVER_PALETTES: BookCoverPalette[] = [
  {
    id: "spruce-green",
    color: "#13382C",
    foilColor: "#E6C687",
    bg: "bg-[#13382C]",
    border: "border-[#1c4d3d]",
    accent: "text-[#E6C687]",
    text: "text-[#E6C687]",
    subtext: "text-[#E6C687]/80",
  },
  {
    id: "oxford-navy",
    color: "#17305C",
    foilColor: "#E6C687",
    bg: "bg-[#17305C]",
    border: "border-[#24457d]",
    accent: "text-[#E6C687]",
    text: "text-[#E6C687]",
    subtext: "text-[#E6C687]/80",
  },
  {
    id: "burnt-terracotta",
    color: "#C45B34",
    foilColor: "#FCE7C8",
    bg: "bg-[#C45B34]",
    border: "border-[#dc724b]",
    accent: "text-[#FCE7C8]",
    text: "text-[#FCE7C8]",
    subtext: "text-[#FCE7C8]/80",
  },
  {
    id: "imperial-crimson",
    color: "#8E2832",
    foilColor: "#FAD8A8",
    bg: "bg-[#8E2832]",
    border: "border-[#ad3742]",
    accent: "text-[#FAD8A8]",
    text: "text-[#FAD8A8]",
    subtext: "text-[#FAD8A8]/80",
  },
  {
    id: "warm-amber",
    color: "#C96D23",
    foilColor: "#FFF3DC",
    bg: "bg-[#C96D23]",
    border: "border-[#e08436]",
    accent: "text-[#FFF3DC]",
    text: "text-[#FFF3DC]",
    subtext: "text-[#FFF3DC]/80",
  },
  {
    id: "mustard-gold",
    color: "#C69214",
    foilColor: "#FFF8E7",
    bg: "bg-[#C69214]",
    border: "border-[#dea519]",
    accent: "text-[#FFF8E7]",
    text: "text-[#FFF8E7]",
    subtext: "text-[#FFF8E7]/80",
  },
  {
    id: "deep-teal",
    color: "#176966",
    foilColor: "#E8FAF8",
    bg: "bg-[#176966]",
    border: "border-[#208783]",
    accent: "text-[#E8FAF8]",
    text: "text-[#E8FAF8]",
    subtext: "text-[#E8FAF8]/80",
  },
  {
    id: "slate-blue",
    color: "#2B527A",
    foilColor: "#EAF2FA",
    bg: "bg-[#2B527A]",
    border: "border-[#39699b]",
    accent: "text-[#EAF2FA]",
    text: "text-[#EAF2FA]",
    subtext: "text-[#EAF2FA]/80",
  },
  {
    id: "royal-purple",
    color: "#4F2A68",
    foilColor: "#F5E9FC",
    bg: "bg-[#4F2A68]",
    border: "border-[#673986]",
    accent: "text-[#F5E9FC]",
    text: "text-[#F5E9FC]",
    subtext: "text-[#F5E9FC]/80",
  },
  {
    id: "dusty-rose",
    color: "#873B53",
    foilColor: "#FDEBF1",
    bg: "bg-[#873B53]",
    border: "border-[#a54a67]",
    accent: "text-[#FDEBF1]",
    text: "text-[#FDEBF1]",
    subtext: "text-[#FDEBF1]/80",
  },
  {
    id: "warm-cream",
    color: "#EAE2D1",
    foilColor: "#2C2014",
    bg: "bg-[#EAE2D1]",
    border: "border-[#d8ccb6]",
    accent: "text-[#2C2014]",
    text: "text-[#2C2014]",
    subtext: "text-[#2C2014]/75",
  },
  {
    id: "charcoal-onyx",
    color: "#181A1B",
    foilColor: "#E6C687",
    bg: "bg-[#181A1B]",
    border: "border-[#2b2e30]",
    accent: "text-[#E6C687]",
    text: "text-[#E6C687]",
    subtext: "text-[#E6C687]/80",
  },
];

/**
 * Calculates foil text color (gilded gold vs dark bronze) depending on background luminance.
 */
export function getFoilTextColor(bgHex: string): string {
  if (!bgHex || typeof bgHex !== "string") return "#E6C687";
  const cleanHex = bgHex.replace(/^#/, "");
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum > 0.6) {
      return "#2C2014"; // Dark antique bronze for light covers
    }
  }
  return "#E6C687"; // Signature champagne gold foil for dark covers
}

/**
 * Checks whether a given URL is a real fetched online cover or a generic Unsplash placeholder.
 */
export function isRealOnlineCover(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes("images.unsplash.com")) return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
}

/**
 * Deterministically computes a book cover palette based on the book's title and author,
 * or accepts a custom color override.
 */
export function getBookCoverPalette(
  title: string = "",
  creator: string = "",
  customColor?: string
): BookCoverPalette {
  if (customColor && customColor.startsWith("#")) {
    const foil = getFoilTextColor(customColor);
    const isLight = foil !== "#E6C687";
    return {
      id: "custom",
      color: customColor,
      foilColor: foil,
      bg: "",
      border: isLight ? "border-black/10" : "border-white/10",
      accent: isLight ? "text-[#2C2014]" : "text-[#E6C687]",
      text: isLight ? "text-[#2C2014]" : "text-[#E6C687]",
      subtext: isLight ? "text-[#2C2014]/75" : "text-[#E6C687]/80",
    };
  }

  const seed = `${title.trim().toLowerCase()}_${creator.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % BOOK_COVER_PALETTES.length;
  return BOOK_COVER_PALETTES[index];
}

/**
 * Computes responsive typography classes for book titles to ensure long titles fit cleanly.
 */
export function getBookCoverTitleClass(title: string = ""): string {
  const len = title.trim().length;
  if (len > 45) {
    return "text-[10px] sm:text-[11px] leading-tight tracking-wider line-clamp-4";
  }
  if (len > 28) {
    return "text-[11px] sm:text-xs leading-snug tracking-wider line-clamp-3";
  }
  if (len > 16) {
    return "text-xs sm:text-[13px] leading-snug tracking-widest line-clamp-3";
  }
  return "text-xs sm:text-sm lg:text-[15px] leading-snug tracking-widest line-clamp-3";
}

/**
 * Computes responsive typography classes for book authors to ensure long author names fit cleanly.
 */
export function getBookCoverAuthorClass(creator: string = ""): string {
  const len = creator.trim().length;
  if (len > 24) {
    return "text-[8px] sm:text-[9px] tracking-wider leading-tight line-clamp-2";
  }
  return "text-[9px] sm:text-[10px] tracking-widest leading-tight line-clamp-2";
}
