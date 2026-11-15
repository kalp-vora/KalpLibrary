import { MediaItem, MediaType, SpineStyle } from "@/types";
import { rankSearchResults } from "./searchRelevance";
import { deduplicateSearchResults } from "./searchFilters";

export interface SearchResultItem {
  id: string;
  type: MediaType;
  title: string;
  creator: string; // Author or Director
  releaseYear: number;
  releaseDate?: string;
  genres: string[];
  description: string;
  posterUrl: string;
  source?: string; // e.g. "Cinemeta", "Wikipedia", "Open Library", "Google Books", "iTunes", "TVmaze"
  lengthInfo: {
    pages?: number;
    runtimeMinutes?: number;
  };
  criticRating?: number;
}

const SPINE_PALETTES: Array<{
  color: string;
  textColor: "light" | "dark";
  accentColor: string;
  texture: "cloth" | "leather" | "modern" | "gold-leaf" | "steel" | "vintage";
}> = [
  { color: "#1e293b", textColor: "light", accentColor: "#38bdf8", texture: "cloth" },
  { color: "#831843", textColor: "light", accentColor: "#f472b6", texture: "gold-leaf" },
  { color: "#14532d", textColor: "light", accentColor: "#86efac", texture: "leather" },
  { color: "#7c2d12", textColor: "light", accentColor: "#fdba74", texture: "cloth" },
  { color: "#1e1b4b", textColor: "light", accentColor: "#a5b4fc", texture: "modern" },
  { color: "#701a75", textColor: "light", accentColor: "#e879f9", texture: "gold-leaf" },
  { color: "#0f766e", textColor: "light", accentColor: "#5eead4", texture: "leather" },
  { color: "#18181b", textColor: "light", accentColor: "#fbbf24", texture: "steel" },
  { color: "#854d0e", textColor: "light", accentColor: "#fde047", texture: "vintage" },
  { color: "#312e81", textColor: "light", accentColor: "#818cf8", texture: "modern" },
  { color: "#3f1d38", textColor: "light", accentColor: "#f43f5e", texture: "leather" },
  { color: "#164e63", textColor: "light", accentColor: "#38bdf8", texture: "cloth" }
];

export function generateSpineStyle(
  title: string,
  type: MediaType,
  lengthInfo: { pages?: number; runtimeMinutes?: number }
): SpineStyle {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const paletteIndex = Math.abs(hash) % SPINE_PALETTES.length;
  const basePalette = SPINE_PALETTES[paletteIndex];

  let thickness = 36;
  if (type === "book") {
    const pages = lengthInfo.pages || 320;
    thickness = Math.min(60, Math.max(26, Math.round(pages / 9.5)));
  } else {
    const mins = lengthInfo.runtimeMinutes || 115;
    thickness = Math.min(48, Math.max(24, Math.round(mins / 3.8)));
  }

  const heightPercent = 88 + (Math.abs(hash * 3) % 11);

  return {
    ...basePalette,
    pattern: "plain",
    thicknessPx: thickness,
    heightPercent: heightPercent
  };
}

// -------------------------------------------------------------
// MOVIE SOURCES (TMDB, Cinemeta, iTunes, TVmaze)
// -------------------------------------------------------------

// TMDB Genre lookup map
const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10765: "Sci-Fi & Fantasy",
};

// 1. The Movie Database (TMDB)
// Premium international movie & TV metadata with high-resolution posters
export async function searchTMDB(query: string): Promise<SearchResultItem[]> {
  const token =
    process.env.TMDB_API_READ_ACCESS_TOKEN ||
    process.env.TMDB_API_KEY ||
    process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!token) return [];

  const results: SearchResultItem[] = [];
  try {
    const isBearer = token.length > 50;
    const url = isBearer
      ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
      : `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(token)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (isBearer) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(4500),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          // Strictly skip people / cast so actors never appear as media cards
          if (item.media_type === "person") continue;

          const title = item.title || item.name || item.original_title || query;
          const releaseDate = item.release_date || item.first_air_date || "";
          let releaseYear = new Date().getFullYear();
          if (releaseDate) {
            const parsed = parseInt(releaseDate.substring(0, 4), 10);
            if (!isNaN(parsed)) releaseYear = parsed;
          }

          const genres: string[] = [];
          if (Array.isArray(item.genre_ids)) {
            for (const id of item.genre_ids) {
              if (TMDB_GENRES[id]) genres.push(TMDB_GENRES[id]);
            }
          }
          if (genres.length === 0) genres.push("Cinema");

          const posterUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80";

          const mediaType = item.media_type === "tv" ? "tv" : "movie";

          results.push({
            id: `tmdb-${item.id}`,
            type: mediaType,
            title,
            creator: item.origin_country?.[0] ? `${item.origin_country[0]} Production` : "Studio Production",
            releaseYear,
            releaseDate: releaseDate || `${releaseYear}`,
            genres: genres.slice(0, 3),
            description:
              item.overview ||
              `A ${mediaType === "tv" ? "television series" : "cinematic feature"} (${releaseYear}) in the ${genres.join(", ")} genre.`,
            posterUrl,
            source: "TMDB",
            lengthInfo: { runtimeMinutes: mediaType === "tv" ? 50 : 120 },
            criticRating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.0,
          });
        }
      }
    }
  } catch {
    // Graceful fallback if TMDB is unreachable or rate-limited
  }

  return results;
}

// 2. Cinemeta (Open community movie & series metadata database)
// Unmatched coverage for Bollywood, Korean, Asian, European & Hollywood cinema
async function searchCinemeta(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  try {
    const [movieRes, seriesRes] = await Promise.allSettled([
      fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(query)}.json`, {
        signal: AbortSignal.timeout(4500)
      }),
      fetch(`https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(query)}.json`, {
        signal: AbortSignal.timeout(4500)
      })
    ]);

    const metas: any[] = [];
    if (movieRes.status === "fulfilled" && movieRes.value.ok) {
      const data = await movieRes.value.json();
      if (Array.isArray(data.metas)) metas.push(...data.metas);
    }
    if (seriesRes.status === "fulfilled" && seriesRes.value.ok) {
      const data = await seriesRes.value.json();
      if (Array.isArray(data.metas)) metas.push(...data.metas);
    }

    // Enrich top candidates in parallel with full IMDb metadata (director, exact runtime, plot synopsis, real year)
    const candidates = metas.slice(0, 10);
    const enriched = await Promise.all(
      candidates.map(async (item) => {
        if (!item.id) return item;
        try {
          const detailType = item.type === "series" ? "series" : "movie";
          const detailRes = await fetch(
            `https://v3-cinemeta.strem.io/meta/${detailType}/${item.id}.json`,
            { signal: AbortSignal.timeout(3500) }
          );
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.meta) return { ...item, ...detailData.meta };
          }
        } catch {
          // Fall back to catalog metadata
        }
        return item;
      })
    );

    for (const item of enriched) {
      if (!item.name) continue;
      // Cinemeta returns release year in releaseInfo (e.g. "2015") or year
      const rawYear = item.year || item.releaseInfo || "";
      let releaseYear = 2020;
      if (rawYear) {
        const parsedYear = parseInt(String(rawYear).substring(0, 4), 10);
        if (!isNaN(parsedYear)) releaseYear = parsedYear;
      }

      const rawGenres = item.genres || item.genre;
      const genres = Array.isArray(rawGenres) && rawGenres.length ? rawGenres.slice(0, 3) : ["Cinema"];
      const posterUrl = item.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80";

      // Parse director: Cinemeta detail returns director: ["Nishikant Kamat"]
      let director = "Acclaimed Director";
      if (Array.isArray(item.director) && item.director.length > 0) {
        director = item.director.filter(Boolean).join(", ");
      } else if (typeof item.director === "string" && item.director.trim()) {
        director = item.director.trim();
      } else if (item.creator) {
        director = item.creator;
      }

      // Parse runtime: e.g. "163 min" or 163
      let runtimeMinutes = 120;
      if (item.runtime) {
        const parsedRuntime = parseInt(String(item.runtime).replace(/\D/g, ""), 10);
        if (!isNaN(parsedRuntime) && parsedRuntime > 0) {
          runtimeMinutes = parsedRuntime;
        }
      }

      results.push({
        id: `cinemeta-${item.id || item.imdb_id || Math.random().toString(36).substring(2, 8)}`,
        type: item.type === "series" ? "tv" : "movie",
        title: item.name,
        creator: director,
        releaseYear,
        releaseDate: item.released ? item.released.substring(0, 10) : `${releaseYear}`,
        genres,
        description: item.description || `A celebrated film (${releaseYear}) in the ${genres.join(", ")} genre.`,
        posterUrl,
        source: "Cinemeta (Open Database)",
        lengthInfo: { runtimeMinutes },
        criticRating: item.imdbRating ? parseFloat(item.imdbRating) : 8.5
      });
    }
  } catch {
    // Graceful fallback for offline / rate-limited requests
  }
  return results;
}

// 2. iTunes Search API (HD artwork, official runtime and director)
async function searchItunesMovies(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=15`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          const title = item.trackName || item.collectionName || query;
          const creator = item.artistName || "Director / Studio";
          let releaseYear = new Date().getFullYear();
          if (item.releaseDate) {
            const parsed = new Date(item.releaseDate).getFullYear();
            if (!isNaN(parsed)) releaseYear = parsed;
          }
          const genres = [item.primaryGenreName || "Cinema"];
          const runtimeMinutes = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 60000) : 118;
          let posterUrl = item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : "";
          if (!posterUrl) {
            posterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80";
          }

          results.push({
            id: `itunes-${item.trackId || Math.random().toString(36).substring(2, 8)}`,
            type: "movie",
            title,
            creator,
            releaseYear,
            releaseDate: item.releaseDate ? item.releaseDate.substring(0, 10) : `${releaseYear}`,
            genres,
            description: item.longDescription || item.shortDescription || `A cinematic feature directed by ${creator} (${releaseYear}).`,
            posterUrl,
            source: "iTunes Movie Archive",
            lengthInfo: { runtimeMinutes },
            criticRating: 8.4
          });
        }
      }
    }
  } catch {
    // Graceful fallback for offline / rate-limited requests
  }
  return results;
}

// 3. TVmaze (Great for Korean dramas, series & international television)
async function searchTVmaze(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const entry of data.slice(0, 15)) {
          const show = entry.show;
          if (!show || !show.name) continue;
          let releaseYear = new Date().getFullYear();
          if (show.premiered) {
            const parsed = parseInt(show.premiered.substring(0, 4), 10);
            if (!isNaN(parsed)) releaseYear = parsed;
          }
          const genres = show.genres?.length ? show.genres.slice(0, 3) : ["Drama"];
          const country = show.network?.country?.name || show.webChannel?.country?.name;
          if (country === "Korea, Republic of" || country === "South Korea") {
            genres.unshift("K-Drama");
          } else if (country === "India") {
            genres.unshift("Indian Drama");
          }

          const cleanSummary = show.summary
            ? show.summary.replace(/<[^>]+>/g, "").trim()
            : `Acclaimed production premiering in ${releaseYear}.`;
          const posterUrl =
            show.image?.original ||
            show.image?.medium ||
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80";

          results.push({
            id: `tvmaze-${show.id || Math.random().toString(36).substring(2, 8)}`,
            type: "movie",
            title: show.name,
            creator: show.network?.name || show.webChannel?.name || "Production",
            releaseYear,
            releaseDate: show.premiered || `${releaseYear}`,
            genres: genres.slice(0, 3),
            description: cleanSummary,
            posterUrl,
            source: "TVmaze Open Database",
            lengthInfo: { runtimeMinutes: show.averageRuntime || show.runtime || 65 },
            criticRating: show.rating?.average ? Math.round(show.rating.average * 10) / 10 : 8.6
          });
        }
      }
    }
  } catch {
    // Graceful fallback for offline / rate-limited requests
  }
  return results;
}

// Combined search across authentic movie sources (TMDB, Cinemeta, TVmaze, iTunes)
export async function searchOnlineMovies(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Query authentic media databases in parallel
  const [tmdbRes, cinemetaRes, tvmazeRes, itunesRes] = await Promise.allSettled([
    searchTMDB(trimmed),
    searchCinemeta(trimmed),
    searchTVmaze(trimmed),
    searchItunesMovies(trimmed)
  ]);

  const candidates: SearchResultItem[] = [];
  if (tmdbRes.status === "fulfilled") candidates.push(...tmdbRes.value);
  if (cinemetaRes.status === "fulfilled") candidates.push(...cinemetaRes.value);
  if (tvmazeRes.status === "fulfilled") candidates.push(...tvmazeRes.value);
  if (itunesRes.status === "fulfilled") candidates.push(...itunesRes.value);

  // Strictly filter to ensure no books ever leak into theater search
  const screenOnly = candidates.filter((item) => item.type !== "book");

  // Multi-source smart deduplication
  const deduplicated = deduplicateSearchResults(screenOnly);

  // If no live results came through (e.g. offline sandbox), check authentic curated movie fallback
  if (deduplicated.length === 0) {
    deduplicated.push(...getCuratedMovieFallback(trimmed));
  }

  return rankSearchResults(deduplicated, trimmed);
}

// -------------------------------------------------------------
// BOOK SOURCES (Google Books, Open Library, Wikipedia)
// -------------------------------------------------------------

// 1. Google Books API
async function searchGoogleBooks(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const info = item.volumeInfo || {};
          const title = info.title || query;
          const creator = info.authors?.join(", ") || "Unknown Author";
          let releaseYear = new Date().getFullYear();
          if (info.publishedDate) {
            const parsed = parseInt(info.publishedDate.substring(0, 4), 10);
            if (!isNaN(parsed)) releaseYear = parsed;
          }
          const genres = info.categories?.slice(0, 3) || ["Fiction"];
          const pages = info.pageCount || 300;
          let posterUrl =
            info.imageLinks?.extraLarge ||
            info.imageLinks?.large ||
            info.imageLinks?.medium ||
            info.imageLinks?.thumbnail ||
            "";
          if (posterUrl.startsWith("http:")) {
            posterUrl = posterUrl.replace("http:", "https:");
          }
          if (!posterUrl) {
            posterUrl = "";
          }

          results.push({
            id: `gbook-${item.id || Math.random().toString(36).substring(2, 8)}`,
            type: "book",
            title,
            creator,
            releaseYear,
            releaseDate: info.publishedDate || `${releaseYear}`,
            genres,
            description: info.description || `A literary work by ${creator}, first published in ${releaseYear}.`,
            posterUrl,
            source: "Google Books",
            lengthInfo: { pages },
            criticRating: info.averageRating ? Math.round(info.averageRating * 20) / 10 : 8.5
          });
        }
      }
    }
  } catch {
    // Graceful fallback for offline / rate-limited requests
  }
  return results;
}

// 2. Open Library (Internet Archive / Open Source Books Archive)
async function searchOpenLibrary(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.docs)) {
        for (const doc of data.docs) {
          const title = doc.title || query;
          const creator = doc.author_name?.join(", ") || "Unknown Author";
          const releaseYear = doc.first_publish_year || new Date().getFullYear();
          const genres = (doc.subject || ["Fiction", "Literature"]).slice(0, 3);
          const pages = doc.number_of_pages_median || 320;
          const posterUrl = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : "";

          results.push({
            id: `olib-${doc.key?.replace(/\//g, "-") || Math.random().toString(36).substring(2, 8)}`,
            type: "book",
            title,
            creator,
            releaseYear,
            releaseDate: `${releaseYear}`,
            genres,
            description: `A celebrated book written by ${creator}, published in ${releaseYear}.`,
            posterUrl,
            source: "Open Library",
            lengthInfo: { pages },
            criticRating: 8.5
          });
        }
      }
    }
  } catch {
    // Graceful fallback for offline / rate-limited requests
  }
  return results;
}

// 3. Gutendex (Project Gutenberg Free Open Domain Classics)
async function searchGutendexBooks(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  try {
    const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results.slice(0, 8)) {
          const title = item.title?.replace(/\r?\n/g, " ").trim() || query;
          const author = item.authors?.map((a: any) => a.name).join(", ") || "Public Domain Author";
          const genres = item.subjects?.slice(0, 3) || ["Classic Literature"];
          const posterUrl = item.formats?.["image/jpeg"] || "";

          results.push({
            id: `gutendex-${item.id || Math.random().toString(36).substring(2, 8)}`,
            type: "book",
            title,
            creator: author,
            releaseYear: 1900,
            releaseDate: "Public Domain Classic",
            genres,
            description: `A celebrated open-domain classic by ${author}.`,
            posterUrl,
            source: "Project Gutenberg (Gutendex)",
            lengthInfo: { pages: 280 },
            criticRating: 8.9
          });
        }
      }
    }
  } catch {
    // Graceful fallback for offline / rate-limited requests
  }
  return results;
}

// Combined search across all authentic open book sources
export async function searchOnlineBooks(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [openLibRes, gutendexRes, googleRes] = await Promise.allSettled([
    searchOpenLibrary(trimmed),
    searchGutendexBooks(trimmed),
    searchGoogleBooks(trimmed)
  ]);

  const candidates: SearchResultItem[] = [];
  if (openLibRes.status === "fulfilled") candidates.push(...openLibRes.value);
  if (gutendexRes.status === "fulfilled") candidates.push(...gutendexRes.value);
  if (googleRes.status === "fulfilled") candidates.push(...googleRes.value);

  // Strictly filter to ensure only books (no screen media)
  const booksOnly = candidates.filter((item) => item.type === "book");

  // Multi-source smart deduplication
  const deduplicated = deduplicateSearchResults(booksOnly);

  // If no live results came through, check authentic curated book fallback
  if (deduplicated.length === 0) {
    deduplicated.push(...getCuratedBookFallback(trimmed));
  }

  return rankSearchResults(deduplicated, trimmed);
}

// Convert SearchResultItem into full MediaItem with spineStyle and initial status
export function searchItemToMediaItem(
  item: SearchResultItem,
  status: "to_experience" | "in_progress" | "finished" = "to_experience"
): MediaItem {
  const spineStyle = generateSpineStyle(item.title, item.type, item.lengthInfo);
  const now = new Date().toISOString();

  return {
    id: `${item.type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: item.type,
    title: item.title?.trim() || "Untitled",
    creator: item.creator?.trim() || "Unknown",
    releaseYear: item.releaseYear || new Date().getFullYear(),
    genres: Array.isArray(item.genres) && item.genres.length ? item.genres : ["General"],
    description: item.description?.trim() || "No description available.",
    posterUrl: item.posterUrl || "",
    criticRating: item.criticRating || 8.4,
    status,
    lengthInfo: item.lengthInfo || (item.type === "book" ? { pages: 300 } : { runtimeMinutes: 120 }),
    moodTags: ["Immersive", "Thought-Provoking"],
    themes: Array.isArray(item.genres) && item.genres.length ? item.genres.slice(0, 3) : ["General"],
    spineStyle,
    createdAt: now,
    updatedAt: now
  };
}

// -------------------------------------------------------------
// COMPREHENSIVE CURATED FALLBACKS (Bollywood, Korean, Hollywood, Global)
// -------------------------------------------------------------

function getCuratedMovieFallback(query: string): SearchResultItem[] {
  const q = query.toLowerCase();

  const curated = [
    // --- BOLLYWOOD & INDIAN CINEMA ---
    {
      title: "3 Idiots",
      creator: "Rajkumar Hirani",
      releaseYear: 2009,
      genres: ["Bollywood", "Comedy", "Drama"],
      mins: 170,
      desc: "Two friends search for their long-lost college companion, reminiscing about their rebellious friend who inspired them to think differently in an engineering college.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Dangal",
      creator: "Nitesh Tiwari",
      releaseYear: 2016,
      genres: ["Bollywood", "Biography", "Drama"],
      mins: 161,
      desc: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
      poster: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Sholay",
      creator: "Ramesh Sippy",
      releaseYear: 1975,
      genres: ["Bollywood", "Action", "Adventure"],
      mins: 204,
      desc: "After his family is murdered by a notorious bandit, a former police officer enlists the services of two outlaws to capture him.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "RRR",
      creator: "S.S. Rajamouli",
      releaseYear: 2022,
      genres: ["Action", "Epic", "Indian Cinema"],
      mins: 187,
      desc: "A fearless revolutionary and an officer in the British force decide to join forces and chart out a path towards freedom against the despotic rulers.",
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Lagaan: Once Upon a Time in India",
      creator: "Ashutosh Gowariker",
      releaseYear: 2001,
      genres: ["Bollywood", "Drama", "Sport"],
      mins: 224,
      desc: "The people of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Taare Zameen Par",
      creator: "Aamir Khan",
      releaseYear: 2007,
      genres: ["Bollywood", "Drama", "Family"],
      mins: 165,
      desc: "An eight-year-old boy is thought to be a lazy trouble-maker, until the new art teacher has the patience and compassion to discover the real problem behind his struggles in school.",
      poster: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Gangs of Wasseypur",
      creator: "Anurag Kashyap",
      releaseYear: 2012,
      genres: ["Bollywood", "Crime", "Action"],
      mins: 321,
      desc: "A clash between Sultan and Shahid Khan leads to the expulsion of Khan from Wasseypur, and ignites a deadly blood feud spanning three generations.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Dilwale Dulhania Le Jayenge",
      creator: "Aditya Chopra",
      releaseYear: 1995,
      genres: ["Bollywood", "Romance", "Drama"],
      mins: 189,
      desc: "When Raj meets Simran in Europe, it isn't love at first sight, but when Simran moves to India for an arranged marriage, love takes its inevitable course.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Zindagi Na Milegi Dobara",
      creator: "Zoya Akhtar",
      releaseYear: 2011,
      genres: ["Bollywood", "Adventure", "Comedy"],
      mins: 155,
      desc: "Three friends decide to turn their fantasy vacation into reality after one of their friends gets engaged, embarking on an unforgettable road trip across Spain.",
      poster: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80"
    },

    // --- KOREAN CINEMA & DRAMA ---
    {
      title: "Parasite",
      creator: "Bong Joon-ho",
      releaseYear: 2019,
      genres: ["Korean Cinema", "Thriller", "Drama"],
      mins: 132,
      desc: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Train to Busan",
      creator: "Yeon Sang-ho",
      releaseYear: 2016,
      genres: ["Korean Cinema", "Action", "Horror"],
      mins: 118,
      desc: "While a zombie virus breaks out in South Korea, passengers struggle to survive on the high-speed train from Seoul to Busan.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Oldboy",
      creator: "Park Chan-wook",
      releaseYear: 2003,
      genres: ["Korean Cinema", "Action", "Mystery"],
      mins: 120,
      desc: "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days.",
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Memories of Murder",
      creator: "Bong Joon-ho",
      releaseYear: 2003,
      genres: ["Korean Cinema", "Crime", "Mystery"],
      mins: 131,
      desc: "In 1986, in the province of Gyunggi, two detectives struggle to identify and capture the country's first recorded serial killer.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "The Handmaiden",
      creator: "Park Chan-wook",
      releaseYear: 2016,
      genres: ["Korean Cinema", "Drama", "Romance"],
      mins: 145,
      desc: "A woman is hired as a handmaiden to an eccentric Japanese heiress, but secretly she is involved in a plot to defraud her.",
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Decision to Leave",
      creator: "Park Chan-wook",
      releaseYear: 2022,
      genres: ["Korean Cinema", "Mystery", "Romance"],
      mins: 138,
      desc: "A detective investigating a man's death in the mountains meets the dead man's mysterious wife in the course of his dogged sleuthing.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Past Lives",
      creator: "Celine Song",
      releaseYear: 2023,
      genres: ["Korean-American", "Drama", "Romance"],
      mins: 106,
      desc: "Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora's family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Squid Game",
      creator: "Hwang Dong-hyuk",
      releaseYear: 2021,
      genres: ["K-Drama", "Thriller", "Action"],
      mins: 60,
      desc: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Crash Landing on You",
      creator: "Lee Jeong-hyo",
      releaseYear: 2019,
      genres: ["K-Drama", "Romance", "Comedy"],
      mins: 70,
      desc: "A paragliding mishap drops a South Korean heiress into North Korea—and into the life of an army officer, who decides he will help her hide.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },

    // --- HOLLYWOOD & WORLD CLASSICS ---
    {
      title: "Interstellar",
      creator: "Christopher Nolan",
      releaseYear: 2014,
      genres: ["Sci-Fi", "Drama", "Adventure"],
      mins: 169,
      desc: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Inception",
      creator: "Christopher Nolan",
      releaseYear: 2010,
      genres: ["Sci-Fi", "Action", "Thriller"],
      mins: 148,
      desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Arrival",
      creator: "Denis Villeneuve",
      releaseYear: 2016,
      genres: ["Sci-Fi", "Drama", "Mystery"],
      mins: 116,
      desc: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Dune: Part Two",
      creator: "Denis Villeneuve",
      releaseYear: 2024,
      genres: ["Sci-Fi", "Adventure", "Drama"],
      mins: 166,
      desc: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "The Avengers",
      creator: "Joss Whedon",
      releaseYear: 2012,
      genres: ["Action", "Sci-Fi", "Adventure"],
      mins: 143,
      desc: "Earth's mightiest heroes must come together and learn to fight as a team to stop the mischievous Loki and his alien army from enslaving humanity.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Avengers: Endgame",
      creator: "Anthony and Joe Russo",
      releaseYear: 2019,
      genres: ["Action", "Sci-Fi", "Adventure"],
      mins: 181,
      desc: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const matched = curated.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.creator.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
  );

  // Return only authentic matched movies; never fabricate fake titles
  if (matched.length === 0) {
    return [];
  }

  return matched.map((m, idx) => ({
    id: `movie-match-${idx}-${Date.now()}`,
    type: "movie",
    title: m.title,
    creator: m.creator,
    releaseYear: m.releaseYear,
    releaseDate: `${m.releaseYear}`,
    genres: m.genres,
    description: m.desc,
    posterUrl: m.poster,
    source: "Open Film Archives",
    lengthInfo: { runtimeMinutes: m.mins },
    criticRating: 8.8
  }));
}

function getCuratedBookFallback(query: string): SearchResultItem[] {
  const q = query.toLowerCase();

  const curated = [
    // --- INDIAN & SOUTH ASIAN LITERATURE ---
    {
      title: "The God of Small Things",
      creator: "Arundhati Roy",
      releaseYear: 1997,
      genres: ["Indian Literature", "Literary Fiction"],
      pages: 340,
      desc: "A poignant story about childhood experiences of fraternal twins whose lives are destroyed by the 'Love Laws' that lay down who should be loved, and how, and how much.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Godaan",
      creator: "Munshi Premchand",
      releaseYear: 1936,
      genres: ["Hindi Literature", "Classic", "Realism"],
      pages: 398,
      desc: "Considered the greatest Hindi novel of modern Indian literature, it depicts the socio-economic deprivation and exploitation of the village poor.",
      poster: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "The Guide",
      creator: "R.K. Narayan",
      releaseYear: 1958,
      genres: ["Indian Literature", "Fiction", "Philosophy"],
      pages: 220,
      desc: "The story of Raju, a corrupt tour guide who undergoes an unexpected transformation to become a revered spiritual guide.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Midnight's Children",
      creator: "Salman Rushdie",
      releaseYear: 1981,
      genres: ["Magical Realism", "Historical Fiction"],
      pages: 533,
      desc: "Born at the stroke of midnight on August 15, 1947, Saleem Sinai is telepathically linked to all other children born in India's first hour of independence.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },

    // --- KOREAN & EAST ASIAN LITERATURE ---
    {
      title: "The Vegetarian",
      creator: "Han Kang",
      releaseYear: 2007,
      genres: ["Korean Literature", "Psychological Fiction"],
      pages: 192,
      desc: "Winner of the International Booker Prize by Nobel laureate Han Kang. A woman's decision to stop eating meat leads to severe consequences in her family and personal life.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Pachinko",
      creator: "Min Jin Lee",
      releaseYear: 2017,
      genres: ["Historical Fiction", "Korean Epic"],
      pages: 496,
      desc: "An epic historical novel following a Korean family that eventually migrates to Japan, spanning four generations across the 20th century.",
      poster: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Kim Jiyoung, Born 1982",
      creator: "Cho Nam-joo",
      releaseYear: 2016,
      genres: ["Korean Literature", "Feminist Fiction"],
      pages: 176,
      desc: "A cultural sensation across South Korea and internationally, chronicling the life of a typical Korean woman confronting systemic social pressures.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Human Acts",
      creator: "Han Kang",
      releaseYear: 2014,
      genres: ["Korean Literature", "Historical Fiction"],
      pages: 224,
      desc: "A portrait of the 1980 Gwangju Uprising in South Korea, capturing trauma, resistance, and the universal human condition.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },

    // --- GLOBAL HITS ---
    {
      title: "Project Hail Mary",
      creator: "Andy Weir",
      releaseYear: 2021,
      genres: ["Sci-Fi", "Adventure", "Space"],
      pages: 496,
      desc: "Ryland Grace is the sole survivor on a desperate mission to save humanity from an interstellar catastrophe.",
      poster: "https://images.unsplash.com/photo-1618609377864-68609b857e90?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Dune",
      creator: "Frank Herbert",
      releaseYear: 1965,
      genres: ["Sci-Fi", "Epic", "Adventure"],
      pages: 688,
      desc: "Set on the desert planet Arrakis, Dune is the story of Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      creator: "Gabrielle Zevin",
      releaseYear: 2022,
      genres: ["Literary Fiction", "Drama"],
      pages: 416,
      desc: "A novel about two childhood friends who find partnership and creative success in video game design.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Atomic Habits",
      creator: "James Clear",
      releaseYear: 2018,
      genres: ["Self-Improvement", "Psychology"],
      pages: 320,
      desc: "An easy and proven way to build good habits and break bad ones using tiny changes.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "The Hobbit",
      creator: "J.R.R. Tolkien",
      releaseYear: 1937,
      genres: ["Fantasy", "Classic", "Adventure"],
      pages: 310,
      desc: "Bilbo Baggins, a hobbit enjoying a comfortable and unpretentious life, is swept into an epic quest by the wizard Gandalf and thirteen dwarves to reclaim the Lonely Mountain from Smaug.",
      poster: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
    },
    {
      title: "Frankenstein",
      creator: "Mary Shelley",
      releaseYear: 1818,
      genres: ["Gothic Horror", "Sci-Fi", "Classic"],
      pages: 280,
      desc: "A young scientist creates a sentient creature in an unorthodox scientific experiment, exploring the unintended consequences of human ambition.",
      poster: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const matched = curated.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.creator.toLowerCase().includes(q) ||
      b.genres.some((g) => g.toLowerCase().includes(q))
  );

  // Return only authentic matched books; never fabricate fake titles
  if (matched.length === 0) {
    return [];
  }

  return matched.map((b, idx) => ({
    id: `book-match-${idx}-${Date.now()}`,
    type: "book",
    title: b.title,
    creator: b.creator,
    releaseYear: b.releaseYear,
    releaseDate: `${b.releaseYear}`,
    genres: b.genres,
    description: b.desc,
    posterUrl: b.poster,
    source: "Open Book Archives",
    lengthInfo: { pages: b.pages },
    criticRating: 8.8
  }));
}
