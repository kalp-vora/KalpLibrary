import { MediaType, ItemStatus, MediaItem } from "@/types";

export interface MediaTypeConfig {
  type: MediaType;
  label: string;
  verb: "Read" | "Watch";
  actionVerb: "Reading" | "Watching";
  startVerb: string;
  markVerb: string;
  queueName: "ReadList" | "Watchlist";
  creatorPrefix: string;
  defaultPoster: string;
  sampleQueries: string[];
  searchArchiveDescription: string;
  searchPlaceholder: string;
  formatLength: (info?: MediaItem["lengthInfo"]) => string;
}

export const MEDIA_CONFIG: Record<MediaType, MediaTypeConfig> = {
  book: {
    type: "book",
    label: "Book",
    verb: "Read",
    actionVerb: "Reading",
    startVerb: "Start Reading",
    markVerb: "Mark Read",
    queueName: "ReadList",
    creatorPrefix: "By ",
    defaultPoster: "",
    sampleQueries: [
      "The Vegetarian",
      "The God of Small Things",
      "Godaan",
      "Pachinko",
      "Project Hail Mary",
      "Dune",
      "Atomic Habits",
    ],
    searchArchiveDescription:
      "Search global and regional literature archives (Google Books, Open Library, Wikipedia).",
    searchPlaceholder:
      "Type a book title, author, or keyword (e.g. Dune, Murakami, Orwell)...",
    formatLength: (info) => `${info?.pages || 300} pages`,
  },
  movie: {
    type: "movie",
    label: "Movie",
    verb: "Watch",
    actionVerb: "Watching",
    startVerb: "Start Watching",
    markVerb: "Mark Watched",
    queueName: "Watchlist",
    creatorPrefix: "Directed by ",
    defaultPoster: "",
    sampleQueries: [
      "3 Idiots",
      "Parasite",
      "Train to Busan",
      "Dangal",
      "RRR",
      "Oldboy",
      "Past Lives",
      "Interstellar",
      "Inception",
    ],
    searchArchiveDescription:
      "Search world cinema archives (Cinemeta IMDb index, Wikipedia, TVmaze).",
    searchPlaceholder:
      "Type a movie title, director, or keyword (e.g. Interstellar, Nolan, Bong Joon-ho)...",
    formatLength: (info) => `${info?.runtimeMinutes || 120} min`,
  },
  tv: {
    type: "tv",
    label: "TV Series",
    verb: "Watch",
    actionVerb: "Watching",
    startVerb: "Start Watching",
    markVerb: "Mark Watched",
    queueName: "Watchlist",
    creatorPrefix: "Created by ",
    defaultPoster: "",
    sampleQueries: [
      "Breaking Bad",
      "Succession",
      "Squid Game",
      "Stranger Things",
      "Chernobyl",
      "Dark",
      "The Bear",
    ],
    searchArchiveDescription:
      "Search television series archives (TVmaze, Wikipedia, Cinemeta).",
    searchPlaceholder:
      "Type a TV series title or keyword (e.g. Breaking Bad, Succession)...",
    formatLength: (info) => {
      const seasons = info?.seasons || 1;
      return `${seasons} season${seasons > 1 ? "s" : ""}`;
    },
  },
  anime: {
    type: "anime",
    label: "Anime",
    verb: "Watch",
    actionVerb: "Watching",
    startVerb: "Start Watching",
    markVerb: "Mark Watched",
    queueName: "Watchlist",
    creatorPrefix: "Created by ",
    defaultPoster: "",
    sampleQueries: [
      "Attack on Titan",
      "Death Note",
      "Fullmetal Alchemist",
      "Spirited Away",
      "Demon Slayer",
      "Frieren",
      "Jujutsu Kaisen",
    ],
    searchArchiveDescription:
      "Search anime archives (Cinemeta, TVmaze, Wikipedia).",
    searchPlaceholder:
      "Type an anime title or keyword (e.g. Attack on Titan, Frieren)...",
    formatLength: (info) => {
      if (info?.episodes) return `${info.episodes} eps`;
      const seasons = info?.seasons || 1;
      return `${seasons} season${seasons > 1 ? "s" : ""}`;
    },
  },
};

export interface StatusConfig {
  status: ItemStatus;
  label: string;
  badgeClass: string;
  getQueueLabel: (type: MediaType) => string;
  getAddedMessage: (type: MediaType) => string;
}

export const STATUS_CONFIG: Record<ItemStatus, StatusConfig> = {
  to_experience: {
    status: "to_experience",
    label: "To Experience",
    badgeClass: "bg-surface/90 text-text-main border border-theme-border shadow-sm",
    getQueueLabel: (type) => `To ${MEDIA_CONFIG[type]?.verb || "Watch"}`,
    getAddedMessage: (type) => `Added to ${MEDIA_CONFIG[type]?.queueName || "Watchlist"}!`,
  },
  in_progress: {
    status: "in_progress",
    label: "In Progress",
    badgeClass: "bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30 shadow-sm",
    getQueueLabel: () => "In Progress",
    getAddedMessage: (type) => `Now ${MEDIA_CONFIG[type]?.actionVerb || "Watching"}!`,
  },
  finished: {
    status: "finished",
    label: "Finished",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm",
    getQueueLabel: () => "Finished",
    getAddedMessage: () => "Added to Journey!",
  },
};

export function getMediaConfig(type: MediaType): MediaTypeConfig {
  return MEDIA_CONFIG[type] || MEDIA_CONFIG.movie;
}

export function getStatusConfig(status: ItemStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.to_experience;
}
