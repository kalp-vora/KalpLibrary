export type MediaType = 'book' | 'movie' | 'tv' | 'anime';

export type ItemStatus = 'to_experience' | 'in_progress' | 'finished';

export interface EpisodeProgress {
  id?: string;
  seasonNumber: number;
  episodeNumber: number;
  title?: string;
  watched: boolean;
  userRating?: number;
  thoughts?: string;
  watchedAt?: string;
}

export interface TvAnimeProgress {
  totalSeasons?: number;
  totalEpisodes?: number;
  currentSeason?: number;
  currentEpisode?: number;
  episodes?: EpisodeProgress[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  themePreference: 'dark' | 'light';
  stats?: {
    totalItems: number;
    watchlistCount: number;
    readListCount: number;
    watchedCount: number;
    readCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewData {
  finishedDate: string; // ISO date string YYYY-MM-DD
  rating: number; // 1 to 5 stars
  thoughts: string; // Thoughts, impressions
  takeaways: string; // Key takeaways and life lessons
  favoriteQuote?: string; // Favorite quote or memorable line
  wouldRecommendTo?: string; // Who would appreciate this
}

export interface ResearchNotes {
  aiSummary: string;
  whyItsNotable: string;
  vibes: string; // e.g. "Atmospheric, philosophical, existential"
  bestFor: string; // e.g. "Late night deep thinkers, lovers of cosmic puzzles"
  keyThemes: string[];
  contentWarnings?: string[];
  similarTitles?: string[];
}

export interface SpineStyle {
  color: string; // Hex color code
  textColor: 'light' | 'dark';
  accentColor: string;
  texture?: 'leather' | 'cloth' | 'modern' | 'gold-leaf' | 'steel' | 'vintage';
  pattern?: 'plain' | 'embossed' | 'stripes' | 'vintage' | 'modern';
  heightPercent?: number; // 85% to 100% of shelf height
  thicknessPx?: number; // 24px to 54px depending on length
}

export interface MediaItem {
  id: string;
  userId?: string;
  type: MediaType;
  title: string;
  creator: string; // Author or Director/Creator
  releaseYear: number;
  genres: string[];
  description: string;
  posterUrl: string;
  criticRating?: number; // 0 - 10 scale (e.g. 8.4)
  userRating?: number; // 1 - 5 stars
  status: ItemStatus;
  
  // Specific length info
  lengthInfo: {
    pages?: number;
    runtimeMinutes?: number;
    seasons?: number;
    episodes?: number;
  };

  // TV / Anime Season & Episode tracking
  tvAnimeProgress?: TvAnimeProgress;

  moodTags: string[];
  themes: string[];
  
  // Research breakdown
  researchNotes?: ResearchNotes;
  
  // Review journal when finished
  review?: ReviewData;

  // Visual shelf appearance for the continuous bookshelf
  spineStyle?: SpineStyle;

  createdAt: string;
  updatedAt: string;
}

export interface MoodMatchResult {
  recommendedItem: MediaItem;
  matchScore: number; // 0 to 100
  pitch: string; // Personalized AI rationale why it fits your mood
  highlightQuote?: string;
  whyRightNow: string;
  alternativeItem?: MediaItem;
}

export interface LibraryStats {
  totalItems: number;
  totalBooks: number;
  totalMovies: number;
  totalTV: number;
  finishedBooks: number;
  finishedMovies: number;
  finishedTV: number;
  totalPagesRead: number;
  totalHoursWatched: number;
  averageRating: number;
  topGenres: { genre: string; count: number }[];
}

export interface FilterOptions {
  type: 'all' | MediaType;
  status: 'all' | ItemStatus;
  genre: string;
  minRating: number;
  searchQuery: string;
  sortBy: 'dateAdded' | 'rating' | 'releaseYear' | 'title' | 'pagesOrLength';
  sortOrder: 'asc' | 'desc';
}

export interface FirebaseConfigInput {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}
