import { MediaItem, MediaType } from "@/types";
import { SearchResultItem } from "./onlineResources";
import { getDayOfYear } from "./timeHelpers";
import { getUserSearchAffinity } from "./searchHistory";

export interface RecommendationResult {
  book: {
    item: SearchResultItem;
    sourceType: "wishlist" | "open_source";
    reason?: string;
  };
  movie: {
    item: SearchResultItem;
    sourceType: "wishlist" | "open_source";
    reason?: string;
  };
}

export interface DailyQuote {
  quote: string;
  author: string;
  work: string;
  type: MediaType;
  year?: number;
  fromUserCollection?: boolean;
}

export interface GenreProfile {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  bookGenres: string[];
  movieGenres: string[];
}

export const GENRE_PROFILES: GenreProfile[] = [
  {
    id: "scifi",
    label: "Sci-Fi",
    icon: "🌌",
    keywords: ["sci-fi", "science fiction", "space", "future", "cosmos", "dune", "interstellar", "arrival"],
    bookGenres: ["Sci-Fi", "Science Fiction", "Speculative"],
    movieGenres: ["Sci-Fi", "Science Fiction", "Space"]
  },
  {
    id: "philosophy",
    label: "Philosophy & Classics",
    icon: "🧠",
    keywords: ["philosophy", "philosophical", "classics", "thought", "wisdom", "stoicism", "existential"],
    bookGenres: ["Philosophy", "Classics", "Literary Fiction"],
    movieGenres: ["Philosophy", "Philosophical", "Classics", "World Cinema"]
  },
  {
    id: "mystery",
    label: "Mystery & Detective",
    icon: "🔍",
    keywords: ["mystery", "detective", "crime", "investigation", "clue", "sherlock"],
    bookGenres: ["Mystery", "Crime", "Detective"],
    movieGenres: ["Mystery", "Crime", "Film Noir"]
  },
  {
    id: "thriller",
    label: "Thriller & Suspense",
    icon: "⚡",
    keywords: ["thriller", "suspense", "psychological", "gripping", "tension"],
    bookGenres: ["Thriller", "Suspense", "Psychological Thriller"],
    movieGenres: ["Thriller", "Suspense", "Psychological"]
  },
  {
    id: "romance",
    label: "Romance & Drama",
    icon: "❤️",
    keywords: ["romance", "romantic", "love", "passion", "relationship"],
    bookGenres: ["Romance", "Contemporary Romance", "Romantic Fiction"],
    movieGenres: ["Romance", "Romantic Drama"]
  },
  {
    id: "fantasy",
    label: "Fantasy & Myth",
    icon: "🐉",
    keywords: ["fantasy", "magic", "myth", "epic fantasy", "realm"],
    bookGenres: ["Fantasy", "Epic Fantasy", "Mythology"],
    movieGenres: ["Fantasy", "Adventure", "Mythology"]
  },
  {
    id: "action",
    label: "Action & Adventure",
    icon: "⚔️",
    keywords: ["action", "adventure", "journey", "quest", "hero"],
    bookGenres: ["Action", "Adventure", "Historical Adventure"],
    movieGenres: ["Action", "Adventure", "Epic"]
  },
  {
    id: "comedy",
    label: "Comedy & Satire",
    icon: "🎭",
    keywords: ["comedy", "humor", "satire", "funny", "lighthearted"],
    bookGenres: ["Comedy", "Humor", "Satire"],
    movieGenres: ["Comedy", "Humor", "Satire"]
  },
  {
    id: "history",
    label: "Historical Fiction",
    icon: "🏛️",
    keywords: ["historical", "history", "period", "biography", "epic history"],
    bookGenres: ["Historical Fiction", "History", "Biography"],
    movieGenres: ["History", "Biography", "Period Drama"]
  },
  {
    id: "animation",
    label: "Animation & Anime",
    icon: "🎨",
    keywords: ["animation", "anime", "animated", "studio ghibli", "illustrated"],
    bookGenres: ["Graphic Novel", "Illustrated", "Fantasy"],
    movieGenres: ["Animation", "Anime", "Family"]
  }
];

// Open-source curated catalogs (Books)
const OPEN_SOURCE_BOOKS_CATALOG: SearchResultItem[] = [
  // Sci-Fi
  {
    id: "os-book-dune",
    type: "book",
    title: "Dune",
    creator: "Frank Herbert",
    releaseYear: 1965,
    genres: ["Sci-Fi", "Science Fiction", "Epic"],
    description: "Set on the desert planet Arrakis, a monumental saga of politics, ecology, and human destiny.",
    posterUrl: "https://covers.openlibrary.org/b/id/9124434-L.jpg",
    source: "Open Library",
    lengthInfo: { pages: 688 },
    criticRating: 9.4
  },
  {
    id: "os-book-foundation",
    type: "book",
    title: "Foundation",
    creator: "Isaac Asimov",
    releaseYear: 1951,
    genres: ["Sci-Fi", "Science Fiction", "Space"],
    description: "Hari Seldon uses psychohistory to predict the fall of the Galactic Empire and preserve human knowledge across dark ages.",
    posterUrl: "https://covers.openlibrary.org/b/id/8316264-L.jpg",
    source: "Open Library & Internet Archive",
    lengthInfo: { pages: 255 },
    criticRating: 9.2
  },
  {
    id: "os-book-neuromancer",
    type: "book",
    title: "Neuromancer",
    creator: "William Gibson",
    releaseYear: 1984,
    genres: ["Sci-Fi", "Science Fiction", "Speculative"],
    description: "Case, a washed-up computer hacker, is hired by a mysterious employer for a high-stakes hack against an artificial intelligence.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 271 },
    criticRating: 9.0
  },
  {
    id: "os-book-solaris",
    type: "book",
    title: "Solaris",
    creator: "Stanisław Lem",
    releaseYear: 1961,
    genres: ["Sci-Fi", "Science Fiction", "Philosophy"],
    description: "Scientists on an isolated research station orbiting the sentient ocean planet Solaris confront the living embodiments of their deepest memories.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 204 },
    criticRating: 9.1
  },
  {
    id: "os-book-lefthand",
    type: "book",
    title: "The Left Hand of Darkness",
    creator: "Ursula K. Le Guin",
    releaseYear: 1969,
    genres: ["Sci-Fi", "Science Fiction", "Speculative"],
    description: "A human envoy travels to the frozen planet of Gethen, whose ambisexual inhabitants challenge earthbound conceptions of gender and society.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 304 },
    criticRating: 9.3
  },

  // Philosophy & Classics
  {
    id: "os-book-ficciones",
    type: "book",
    title: "Ficciones",
    creator: "Jorge Luis Borges",
    releaseYear: 1944,
    genres: ["Philosophy", "Classics", "Short Stories"],
    description: "Metaphysical labyrinths, infinite libraries, and circular ruins challenging the nature of reality and thought.",
    posterUrl: "",
    source: "Open Library & Public Domain",
    lengthInfo: { pages: 174 },
    criticRating: 9.3
  },
  {
    id: "os-book-meditations",
    type: "book",
    title: "Meditations",
    creator: "Marcus Aurelius",
    releaseYear: 180,
    genres: ["Philosophy", "Classics", "Non-Fiction"],
    description: "Private spiritual reflections and Stoic exercises of a Roman emperor on self-discipline, mortality, and tranquility.",
    posterUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 254 },
    criticRating: 9.2
  },
  {
    id: "os-book-stranger",
    type: "book",
    title: "The Stranger",
    creator: "Albert Camus",
    releaseYear: 1942,
    genres: ["Philosophy", "Classics", "Literary Fiction"],
    description: "Meursault, an emotionally detached Algerian clerk, commits an unprovoked murder and undergoes trial, exploring existential absurdity.",
    posterUrl: "",
    source: "Open Library & Public Domain",
    lengthInfo: { pages: 123 },
    criticRating: 9.1
  },
  {
    id: "os-book-crimeandpunishment",
    type: "book",
    title: "Crime and Punishment",
    creator: "Fyodor Dostoevsky",
    releaseYear: 1866,
    genres: ["Philosophy", "Classics", "Literary Fiction"],
    description: "The mental anguish and moral dilemmas of Rodion Raskolnikov, an impoverished Saint Petersburg student who plans and executes a murder.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 551 },
    criticRating: 9.5
  },

  // Mystery & Detective
  {
    id: "os-book-sherlock",
    type: "book",
    title: "The Hound of the Baskervilles",
    creator: "Arthur Conan Doyle",
    releaseYear: 1902,
    genres: ["Mystery", "Crime", "Detective"],
    description: "Sherlock Holmes and Dr. Watson investigate the curse of a spectral hound haunting the foggy moors of Devonshire.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 256 },
    criticRating: 9.0
  },
  {
    id: "os-book-andthentherewerenone",
    type: "book",
    title: "And Then There Were None",
    creator: "Agatha Christie",
    releaseYear: 1939,
    genres: ["Mystery", "Crime", "Detective"],
    description: "Ten strangers lured to an isolated island off the Devon coast are murdered one by one according to a nursery rhyme.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 272 },
    criticRating: 9.4
  },
  {
    id: "os-book-nameorose",
    type: "book",
    title: "The Name of the Rose",
    creator: "Umberto Eco",
    releaseYear: 1980,
    genres: ["Mystery", "Crime", "Classics"],
    description: "Friar William of Baskerville investigates bizarre deaths at a remote 14th-century Italian monastery harboring forbidden manuscripts.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 512 },
    criticRating: 9.2
  },

  // Thriller & Suspense
  {
    id: "os-book-1984",
    type: "book",
    title: "1984",
    creator: "George Orwell",
    releaseYear: 1949,
    genres: ["Thriller", "Suspense", "Dystopian"],
    description: "A chilling vision of totalitarian surveillance, thought control, and the rebellion of Winston Smith.",
    posterUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    source: "Open Library & Public Domain",
    lengthInfo: { pages: 328 },
    criticRating: 9.5
  },
  {
    id: "os-book-silenceoflambs",
    type: "book",
    title: "The Silence of the Lambs",
    creator: "Thomas Harris",
    releaseYear: 1988,
    genres: ["Thriller", "Suspense", "Psychological Thriller"],
    description: "FBI trainee Clarice Starling seeks the counsel of imprisoned cannibalistic psychiatrist Dr. Hannibal Lecter to catch a serial killer.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 352 },
    criticRating: 9.3
  },
  {
    id: "os-book-shutterisland",
    type: "book",
    title: "Shutter Island",
    creator: "Dennis Lehane",
    releaseYear: 2003,
    genres: ["Thriller", "Suspense", "Psychological Thriller"],
    description: "U.S. Marshal Teddy Daniels arrives at Ashecliffe Hospital for the criminally insane to investigate an escape, only to doubt his own sanity.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 384 },
    criticRating: 9.1
  },

  // Romance & Drama
  {
    id: "os-book-pride",
    type: "book",
    title: "Pride and Prejudice",
    creator: "Jane Austen",
    releaseYear: 1813,
    genres: ["Romance", "Classics", "Drama"],
    description: "The turbulent relationship between Elizabeth Bennet, the daughter of a country gentleman, and Fitzwilliam Darcy.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 432 },
    criticRating: 9.4
  },
  {
    id: "os-book-janeeyre",
    type: "book",
    title: "Jane Eyre",
    creator: "Charlotte Brontë",
    releaseYear: 1847,
    genres: ["Romance", "Classics", "Drama"],
    description: "An orphaned governess falls for her brooding employer, Edward Rochester, while discovering the dark secret of Thornfield Hall.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 507 },
    criticRating: 9.3
  },
  {
    id: "os-book-wutheringheights",
    type: "book",
    title: "Wuthering Heights",
    creator: "Emily Brontë",
    releaseYear: 1847,
    genres: ["Romance", "Classics", "Drama"],
    description: "A tempestuous tale of all-consuming passion and vindictive retribution between Heathcliff and Catherine Earnshaw on the Yorkshire moors.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 416 },
    criticRating: 9.1
  },

  // Fantasy & Myth
  {
    id: "os-book-hobbit",
    type: "book",
    title: "The Hobbit",
    creator: "J.R.R. Tolkien",
    releaseYear: 1937,
    genres: ["Fantasy", "Epic Fantasy", "Adventure"],
    description: "Bilbo Baggins, a peaceful hobbit, is whisked away on an unexpected quest to reclaim the lost dwarf kingdom of Erebor.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 310 },
    criticRating: 9.3
  },
  {
    id: "os-book-fellowship",
    type: "book",
    title: "The Fellowship of the Ring",
    creator: "J.R.R. Tolkien",
    releaseYear: 1954,
    genres: ["Fantasy", "Epic Fantasy", "Adventure"],
    description: "Frodo Baggins inherits the One Ring of Power and must embark on an epic fellowship voyage across Middle-earth to destroy it.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 423 },
    criticRating: 9.7
  },
  {
    id: "os-book-earthsea",
    type: "book",
    title: "A Wizard of Earthsea",
    creator: "Ursula K. Le Guin",
    releaseYear: 1968,
    genres: ["Fantasy", "Epic Fantasy", "Mythology"],
    description: "Ged, a reckless young sorcerer, accidentally unleashes an ancient shadow into the world of Earthsea and must master balance to overcome it.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 205 },
    criticRating: 9.2
  },

  // Action & Adventure
  {
    id: "os-book-montecristo",
    type: "book",
    title: "The Count of Monte Cristo",
    creator: "Alexandre Dumas",
    releaseYear: 1844,
    genres: ["Action", "Adventure", "Classics"],
    description: "Falsely accused of treason, Edmond Dantès escapes from the Château d'If to enact meticulous retribution against his betrayers.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 1276 },
    criticRating: 9.6
  },
  {
    id: "os-book-threemusketeers",
    type: "book",
    title: "The Three Musketeers",
    creator: "Alexandre Dumas",
    releaseYear: 1844,
    genres: ["Action", "Adventure", "Historical Adventure"],
    description: "Young d'Artagnan joins forces with Athos, Porthos, and Aramis to defend the French king and queen against Cardinal Richelieu's plots.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 625 },
    criticRating: 9.2
  },
  {
    id: "os-book-treasureisland",
    type: "book",
    title: "Treasure Island",
    creator: "Robert Louis Stevenson",
    releaseYear: 1883,
    genres: ["Action", "Adventure", "Classics"],
    description: "Young Jim Hawkins discovers a pirate treasure map and embarks on a dangerous Caribbean voyage opposite the cunning Long John Silver.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 292 },
    criticRating: 9.0
  },

  // Comedy & Satire
  {
    id: "os-book-ove",
    type: "book",
    title: "A Man Called Ove",
    creator: "Fredrik Backman",
    releaseYear: 2012,
    genres: ["Comedy", "Humor", "Drama"],
    description: "A grumpy yet loveable curmudgeon's solitary world is turned upside down by lively new neighbors in this heartwarming tale.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 337 },
    criticRating: 8.9
  },
  {
    id: "os-book-hitchhiker",
    type: "book",
    title: "The Hitchhiker's Guide to the Galaxy",
    creator: "Douglas Adams",
    releaseYear: 1979,
    genres: ["Comedy", "Humor", "Satire"],
    description: "Arthur Dent is saved by his alien researcher friend Ford Prefect right before Earth is demolished to make way for a hyperspace bypass.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 224 },
    criticRating: 9.4
  },
  {
    id: "os-book-goodomens",
    type: "book",
    title: "Good Omens",
    creator: "Neil Gaiman & Terry Pratchett",
    releaseYear: 1990,
    genres: ["Comedy", "Humor", "Fantasy"],
    description: "An eccentric angel and a fast-living demon who have grown fond of comfortable life on Earth team up to avert the apocalypse.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 412 },
    criticRating: 9.3
  },

  // Historical Fiction
  {
    id: "os-book-warandpeace",
    type: "book",
    title: "War and Peace",
    creator: "Leo Tolstoy",
    releaseYear: 1869,
    genres: ["Historical Fiction", "History", "Classics"],
    description: "A sweeping chronicle of French invasion of Russia and the impact of the Napoleonic era on Tsarist society through five aristocratic families.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 1225 },
    criticRating: 9.5
  },
  {
    id: "os-book-bookthief",
    type: "book",
    title: "The Book Thief",
    creator: "Markus Zusak",
    releaseYear: 2005,
    genres: ["Historical Fiction", "History", "Drama"],
    description: "Narrated by Death, the story of young Liesel Meminger living in Nazi Germany who discovers solace by stealing books and sharing them.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 552 },
    criticRating: 9.4
  },
  {
    id: "os-book-allquiet",
    type: "book",
    title: "All Quiet on the Western Front",
    creator: "Erich Maria Remarque",
    releaseYear: 1929,
    genres: ["Historical Fiction", "History", "Classics"],
    description: "The harrowing physical and mental toll of World War I warfare experienced firsthand by young German soldier Paul Bäumer.",
    posterUrl: "",
    source: "Project Gutenberg & Open Library",
    lengthInfo: { pages: 296 },
    criticRating: 9.3
  },

  // Animation & Graphic Works
  {
    id: "os-book-littleprince",
    type: "book",
    title: "The Little Prince",
    creator: "Antoine de Saint-Exupéry",
    releaseYear: 1943,
    genres: ["Graphic Novel", "Illustrated", "Fantasy"],
    description: "A young prince visits various planets in space, addressing themes of loneliness, friendship, love, and loss.",
    posterUrl: "",
    source: "Open Library & Public Domain",
    lengthInfo: { pages: 96 },
    criticRating: 9.3
  },
  {
    id: "os-book-persepolis",
    type: "book",
    title: "Persepolis",
    creator: "Marjane Satrapi",
    releaseYear: 2000,
    genres: ["Graphic Novel", "Illustrated", "Biography"],
    description: "A graphic memoir chronicling the author's childhood in Iran during and after the Islamic Revolution.",
    posterUrl: "",
    source: "Open Library",
    lengthInfo: { pages: 153 },
    criticRating: 9.3
  }
];

// Open-source curated catalogs (Movies)
const OPEN_SOURCE_MOVIES_CATALOG: SearchResultItem[] = [
  // Sci-Fi
  {
    id: "os-movie-interstellar",
    type: "movie",
    title: "Interstellar",
    creator: "Christopher Nolan",
    releaseYear: 2014,
    genres: ["Sci-Fi", "Science Fiction", "Space"],
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival beyond a dying Earth.",
    posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 169 },
    criticRating: 9.3
  },
  {
    id: "os-movie-arrival",
    type: "movie",
    title: "Arrival",
    creator: "Denis Villeneuve",
    releaseYear: 2016,
    genres: ["Sci-Fi", "Science Fiction", "Space"],
    description: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 116 },
    criticRating: 9.2
  },
  {
    id: "os-movie-2001",
    type: "movie",
    title: "2001: A Space Odyssey",
    creator: "Stanley Kubrick",
    releaseYear: 1968,
    genres: ["Sci-Fi", "Science Fiction", "Space"],
    description: "After uncovering a mysterious artifact on the Moon, mankind embarks on a voyage to Jupiter accompanied by the intelligent computer HAL 9000.",
    posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 149 },
    criticRating: 9.4
  },
  {
    id: "os-movie-bladerunner2049",
    type: "movie",
    title: "Blade Runner 2049",
    creator: "Denis Villeneuve",
    releaseYear: 2017,
    genres: ["Sci-Fi", "Science Fiction", "Speculative"],
    description: "Young Blade Runner K unearths a long-buried secret that leads him to track down former blade runner Rick Deckard.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 164 },
    criticRating: 9.1
  },

  // Philosophy & Classics
  {
    id: "os-movie-seventh-seal",
    type: "movie",
    title: "The Seventh Seal",
    creator: "Ingmar Bergman",
    releaseYear: 1957,
    genres: ["Philosophy", "Drama", "Classics"],
    description: "A medieval knight plays chess against Death on a desolate shoreline while seeking answers to existence.",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    source: "Internet Archive & Public Domain",
    lengthInfo: { runtimeMinutes: 96 },
    criticRating: 9.0
  },
  {
    id: "os-movie-veronique",
    type: "movie",
    title: "The Double Life of Véronique",
    creator: "Krzysztof Kieślowski",
    releaseYear: 1991,
    genres: ["Drama", "Philosophy", "World Cinema"],
    description: "Two women share an inexplicable metaphysical affinity and musical talent without ever knowing one another.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 98 },
    criticRating: 9.0
  },
  {
    id: "os-movie-stalker",
    type: "movie",
    title: "Stalker",
    creator: "Andrei Tarkovsky",
    releaseYear: 1979,
    genres: ["Philosophy", "Sci-Fi", "World Cinema"],
    description: "A guide leads a writer and a scientist through the hazardous post-apocalyptic wasteland known as the Zone to find the Room.",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    source: "Mosfilm & Internet Archive",
    lengthInfo: { runtimeMinutes: 162 },
    criticRating: 9.3
  },
  {
    id: "os-movie-ikiru",
    type: "movie",
    title: "Ikiru",
    creator: "Akira Kurosawa",
    releaseYear: 1952,
    genres: ["Philosophy", "Drama", "Classics"],
    description: "A Tokyo bureaucrat who learns he has terminal cancer resolves to find meaning and create a children's playground in his final months.",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    source: "Internet Archive & Public Domain",
    lengthInfo: { runtimeMinutes: 143 },
    criticRating: 9.5
  },

  // Mystery & Detective
  {
    id: "os-movie-memories",
    type: "movie",
    title: "Memories of Murder",
    creator: "Bong Joon-ho",
    releaseYear: 2003,
    genres: ["Mystery", "Crime", "Thriller"],
    description: "In 1986, two detectives with contrasting styles struggle to identify and capture the country's first recorded serial killer.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 131 },
    criticRating: 9.3
  },
  {
    id: "os-movie-chinatown",
    type: "movie",
    title: "Chinatown",
    creator: "Roman Polanski",
    releaseYear: 1974,
    genres: ["Mystery", "Crime", "Film Noir"],
    description: "Private investigator J.J. Gittes is hired by a woman claiming to be a prominent engineer's wife, uncovering rampant municipal corruption.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 130 },
    criticRating: 9.2
  },
  {
    id: "os-movie-rearwindow",
    type: "movie",
    title: "Rear Window",
    creator: "Alfred Hitchcock",
    releaseYear: 1954,
    genres: ["Mystery", "Thriller", "Classics"],
    description: "A wheelchair-bound photographer spies on his neighbors from his Greenwich Village courtyard window and becomes convinced one has committed murder.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 112 },
    criticRating: 9.4
  },

  // Thriller & Suspense
  {
    id: "os-movie-parasite",
    type: "movie",
    title: "Parasite",
    creator: "Bong Joon-ho",
    releaseYear: 2019,
    genres: ["Thriller", "Suspense", "Drama"],
    description: "Greed and class discrimination unravel the symbiotic bond formed between a destitute family and an affluent household.",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 132 },
    criticRating: 9.4
  },
  {
    id: "os-movie-se7en",
    type: "movie",
    title: "Se7en",
    creator: "David Fincher",
    releaseYear: 1995,
    genres: ["Thriller", "Suspense", "Crime"],
    description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 127 },
    criticRating: 9.3
  },
  {
    id: "os-movie-memento",
    type: "movie",
    title: "Memento",
    creator: "Christopher Nolan",
    releaseYear: 2000,
    genres: ["Thriller", "Suspense", "Mystery"],
    description: "A man with short-term memory loss attempts to track down his wife's murderer using photographs and body tattoos.",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 113 },
    criticRating: 9.2
  },

  // Romance & Drama
  {
    id: "os-movie-in-the-mood",
    type: "movie",
    title: "In the Mood for Love",
    creator: "Wong Kar-wai",
    releaseYear: 2000,
    genres: ["Romance", "Drama", "World Cinema"],
    description: "Two neighbors form a delicate, poetic bond in 1962 Hong Kong after suspecting their spouses of infidelity.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 98 },
    criticRating: 9.4
  },
  {
    id: "os-movie-beforesunrise",
    type: "movie",
    title: "Before Sunrise",
    creator: "Richard Linklater",
    releaseYear: 1995,
    genres: ["Romance", "Drama", "Romantic Drama"],
    description: "A young man and woman meet on a train in Europe and spend one unforgettable, conversation-filled evening together in Vienna.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 101 },
    criticRating: 9.3
  },
  {
    id: "os-movie-pastlives",
    type: "movie",
    title: "Past Lives",
    creator: "Celine Song",
    releaseYear: 2023,
    genres: ["Romance", "Drama", "Romantic Drama"],
    description: "Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora's family emigrates from South Korea, reuniting two decades later.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 106 },
    criticRating: 9.3
  },

  // Fantasy & Myth
  {
    id: "os-movie-spirited-away",
    type: "movie",
    title: "Spirited Away",
    creator: "Hayao Miyazaki",
    releaseYear: 2001,
    genres: ["Fantasy", "Animation", "Adventure"],
    description: "A ten-year-old girl wanders into a magical spirit bathhouse and must discover the courage to free herself and her parents.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Open Anime Archive",
    lengthInfo: { runtimeMinutes: 125 },
    criticRating: 9.5
  },
  {
    id: "os-movie-panslabyrinth",
    type: "movie",
    title: "Pan's Labyrinth",
    creator: "Guillermo del Toro",
    releaseYear: 2006,
    genres: ["Fantasy", "Drama", "Mythology"],
    description: "In post-Civil War Spain, young Ofelia encounters an ancient faun who reveals she is the legendary lost princess of the Underworld.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 118 },
    criticRating: 9.3
  },
  {
    id: "os-movie-princessmononoke",
    type: "movie",
    title: "Princess Mononoke",
    creator: "Hayao Miyazaki",
    releaseYear: 1997,
    genres: ["Fantasy", "Animation", "Epic"],
    description: "On a journey to cure a demonic curse, Prince Ashitaka finds himself in the middle of a war between the forest gods and Iron Town.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Open Anime Archive",
    lengthInfo: { runtimeMinutes: 134 },
    criticRating: 9.4
  },

  // Action & Adventure
  {
    id: "os-movie-rrr",
    type: "movie",
    title: "RRR",
    creator: "S.S. Rajamouli",
    releaseYear: 2022,
    genres: ["Action", "Adventure", "Epic"],
    description: "A fearless revolutionary and an officer in the British force decide to join forces and chart out a path towards freedom.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    source: "Wikipedia & Cinemeta",
    lengthInfo: { runtimeMinutes: 187 },
    criticRating: 9.2
  },
  {
    id: "os-movie-madmaxfuryroad",
    type: "movie",
    title: "Mad Max: Fury Road",
    creator: "George Miller",
    releaseYear: 2015,
    genres: ["Action", "Adventure", "Sci-Fi"],
    description: "In a post-apocalyptic wasteland, Imperator Furiosa rebels against a tyrannical ruler in search for her homeland with the aid of Max Rockatansky.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 120 },
    criticRating: 9.5
  },
  {
    id: "os-movie-crouchingtiger",
    type: "movie",
    title: "Crouching Tiger, Hidden Dragon",
    creator: "Ang Lee",
    releaseYear: 2000,
    genres: ["Action", "Adventure", "Classics"],
    description: "A young Chinese warrior steals a sword from a famed swordsman and embarks on a journey of martial prowess and forbidden romance.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 120 },
    criticRating: 9.3
  },

  // Comedy & Satire
  {
    id: "os-movie-3idiots",
    type: "movie",
    title: "3 Idiots",
    creator: "Rajkumar Hirani",
    releaseYear: 2009,
    genres: ["Comedy", "Humor", "Drama"],
    description: "Two friends search for their long-lost companion while reminiscing about their college years and following true passions.",
    posterUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
    source: "Wikipedia & Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 170 },
    criticRating: 9.2
  },
  {
    id: "os-movie-grandbudapest",
    type: "movie",
    title: "The Grand Budapest Hotel",
    creator: "Wes Anderson",
    releaseYear: 2014,
    genres: ["Comedy", "Humor", "Satire"],
    description: "A writer encounters the owner of an aging high-class European hotel, who tells him of his early years serving as a lobby boy under an exceptional concierge.",
    posterUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 99 },
    criticRating: 9.3
  },
  {
    id: "os-movie-groundhogday",
    type: "movie",
    title: "Groundhog Day",
    creator: "Harold Ramis",
    releaseYear: 1993,
    genres: ["Comedy", "Humor", "Fantasy"],
    description: "A cynical television weatherman finds himself inexplicably living the same day over and over again in Punxsutawney, Pennsylvania.",
    posterUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 101 },
    criticRating: 9.1
  },

  // Historical Fiction & Period
  {
    id: "os-movie-lagaan",
    type: "movie",
    title: "Lagaan: Once Upon a Time in India",
    creator: "Ashutosh Gowariker",
    releaseYear: 2001,
    genres: ["History", "Drama", "Period Drama"],
    description: "The people of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    source: "Wikipedia & Cinemeta",
    lengthInfo: { runtimeMinutes: 224 },
    criticRating: 9.1
  },
  {
    id: "os-movie-1917",
    type: "movie",
    title: "1917",
    creator: "Sam Mendes",
    releaseYear: 2019,
    genres: ["History", "Drama", "Period Drama"],
    description: "Two young British soldiers during the First World War are given an impossible mission: deliver a message deep in enemy territory to stop a massacre.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 119 },
    criticRating: 9.3
  },
  {
    id: "os-movie-gladiator",
    type: "movie",
    title: "Gladiator",
    creator: "Ridley Scott",
    releaseYear: 2000,
    genres: ["History", "Action", "Epic"],
    description: "A former Roman general sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 155 },
    criticRating: 9.4
  },

  // Animation & Anime
  {
    id: "os-movie-yourname",
    type: "movie",
    title: "Your Name",
    creator: "Makoto Shinkai",
    releaseYear: 2016,
    genres: ["Animation", "Anime", "Romance"],
    description: "Two teenagers share a profound, magical connection upon discovering they are swapping bodies across time and distance.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Open Anime Archive",
    lengthInfo: { runtimeMinutes: 106 },
    criticRating: 9.5
  },
  {
    id: "os-movie-spiderverse",
    type: "movie",
    title: "Spider-Man: Into the Spider-Verse",
    creator: "Bob Persichetti & Peter Ramsey",
    releaseYear: 2018,
    genres: ["Animation", "Action", "Adventure"],
    description: "Teenager Miles Morales becomes the new Spider-Man and joins other Spider-Heroes from alternate universes to stop a reality-ending threat.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Cinemeta Open Archive",
    lengthInfo: { runtimeMinutes: 117 },
    criticRating: 9.4
  },
  {
    id: "os-movie-howlsmovingcastle",
    type: "movie",
    title: "Howl's Moving Castle",
    creator: "Hayao Miyazaki",
    releaseYear: 2004,
    genres: ["Animation", "Anime", "Fantasy"],
    description: "When an unconfident young woman is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent wizard in his walking castle.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    source: "Open Anime Archive",
    lengthInfo: { runtimeMinutes: 119 },
    criticRating: 9.3
  }
];

const OPEN_SOURCE_QUOTES: DailyQuote[] = [
  {
    quote: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges",
    work: "Poem of the Gifts",
    type: "book",
    year: 1958
  },
  {
    quote: "In the midst of winter, I found there was, within me, an invincible summer.",
    author: "Albert Camus",
    work: "Return to Tipasa",
    type: "book",
    year: 1952
  },
  {
    quote: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.",
    author: "Christopher Nolan",
    work: "Interstellar",
    type: "movie",
    year: 2014
  },
  {
    quote: "Never let your memories be greater than your dreams.",
    author: "Douglas Coupland",
    work: "Life After God",
    type: "book",
    year: 1994
  },
  {
    quote: "You must be the master of your will and the servant of your conscience.",
    author: "Marcus Aurelius",
    work: "Meditations",
    type: "book",
    year: 180
  },
  {
    quote: "That was memorable: it was the first time I felt as though I was in a story that someone was telling.",
    author: "Wong Kar-wai",
    work: "In the Mood for Love",
    type: "movie",
    year: 2000
  },
  {
    quote: "Despite everything, I still believe that people are really good at heart.",
    author: "Anne Frank",
    work: "The Diary of a Young Girl",
    type: "book",
    year: 1947
  },
  {
    quote: "We accept the reality of the world with which we're presented. It's as simple as that.",
    author: "Peter Weir",
    work: "The Truman Show",
    type: "movie",
    year: 1998
  },
  {
    quote: "The mystery of life isn't a problem to solve, but a reality to experience.",
    author: "Frank Herbert",
    work: "Dune",
    type: "book",
    year: 1965
  },
  {
    quote: "All those moments will be lost in time, like tears in rain.",
    author: "Ridley Scott",
    work: "Blade Runner",
    type: "movie",
    year: 1982
  },
  {
    quote: "It is our choices that show what we truly are, far more than our abilities.",
    author: "J.K. Rowling",
    work: "Harry Potter and the Chamber of Secrets",
    type: "book",
    year: 1998
  },
  {
    quote: "There is some good in this world, and it's worth fighting for.",
    author: "J.R.R. Tolkien",
    work: "The Two Towers",
    type: "book",
    year: 1954
  },
  {
    quote: "Hope is a good thing, maybe the best of things, and no good thing ever dies.",
    author: "Frank Darabont",
    work: "The Shawshank Redemption",
    type: "movie",
    year: 1994
  },
  {
    quote: "Beware; for I am fearless, and therefore powerful.",
    author: "Mary Shelley",
    work: "Frankenstein",
    type: "book",
    year: 1818
  },
  {
    quote: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien",
    work: "The Fellowship of the Ring",
    type: "book",
    year: 1954
  },
  {
    quote: "The only way out of the labyrinth of suffering is to forgive.",
    author: "John Green",
    work: "Looking for Alaska",
    type: "book",
    year: 2005
  }
];

/**
 * Recommendation Engine: Genre-based recommendation prioritizing Wishlist first,
 * then falling back to open-source catalogs.
 */
/**
 * Recommendation Engine: Genre-based recommendation dynamically calibrated for the user's mood.
 * Rotates daily based on day of the year, and immediately adapts whenever a user adds or finishes an item.
 */
export function getMoodRecommendation(
  genreId: string,
  userItems: MediaItem[] = []
): RecommendationResult {
  const profile = GENRE_PROFILES.find((p) => p.id === genreId) || GENRE_PROFILES[0];
  const dayOfYear = getDayOfYear();
  const searchAffinity = typeof window !== "undefined" ? getUserSearchAffinity() : undefined;

  // Normalized set of all titles user already owns or has interacted with (ReadList, Watchlist, in progress, finished)
  const userOwnedTitles = new Set(
    userItems.map((i) => i.title.toLowerCase().trim())
  );

  // Score candidate against genre keywords, genre tags, and user search affinity
  const scoreItem = (item: { title: string; creator?: string; genres: string[]; description: string; moodTags?: string[] }) => {
    let score = 0;
    const combined = [
      item.title,
      item.description,
      ...(item.genres || []),
      ...(item.moodTags || [])
    ].join(" ").toLowerCase();

    profile.keywords.forEach((kw) => {
      if (combined.includes(kw)) score += 10;
    });
    profile.bookGenres.concat(profile.movieGenres).forEach((g) => {
      if (item.genres?.some((ig) => ig.toLowerCase().includes(g.toLowerCase()))) score += 15;
    });

    // Personalization boost from user search history & clicked items
    if (searchAffinity) {
      if (Array.isArray(item.genres)) {
        for (const g of item.genres) {
          const w = searchAffinity.genreWeights[g];
          if (w) score += Math.min(w * 8, 30);
        }
      }
      if (item.creator && searchAffinity.creatorWeights[item.creator.toLowerCase()]) {
        score += Math.min(searchAffinity.creatorWeights[item.creator.toLowerCase()] * 12, 35);
      }
    }

    return score;
  };

  const pickCandidate = (catalog: SearchResultItem[], type: "book" | "movie") => {
    // 1. Exclude titles the user already has in their library.
    // When the user adds to watchlist or marks as read, the title enters userItems and is immediately excluded,
    // causing the recommendation algorithm to advance to the next fresh title in that genre!
    const freshCatalog = catalog.filter(
      (item) => !userOwnedTitles.has(item.title.toLowerCase().trim())
    );

    // If every title in catalog is already owned, fallback to entire catalog
    const pool = freshCatalog.length > 0 ? freshCatalog : catalog;

    // Filter to candidates matching current mood genre, sorted by relevance score
    const matched = pool
      .map((item) => ({ item, score: scoreItem(item) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const candidates = matched.length > 0 ? matched.map((m) => m.item) : pool;

    // 2. Day-of-year rotation + genre offset so recommendations change EVERY day
    const genreSeed = profile.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const dayShift = type === "book" ? 0 : 3;
    const index = (dayOfYear + genreSeed + dayShift) % candidates.length;

    const selected = candidates[index] || candidates[0];

    return {
      item: selected,
      sourceType: "open_source" as const,
      reason: `Today's ${profile.label} pairing curated for your current mood.`
    };
  };

  return {
    book: pickCandidate(OPEN_SOURCE_BOOKS_CATALOG, "book"),
    movie: pickCandidate(OPEN_SOURCE_MOVIES_CATALOG, "movie")
  };
}

/**
 * Recommendation Engine: Daily recommendation regardless of mood.
 * Considers user's previously watched/read items, their ratings (e.g. 4-5 stars),
 * and preferred genres.
 */
export function getDailyRecommendation(userItems: MediaItem[]): {
  book: SearchResultItem;
  movie: SearchResultItem;
  reason: string;
} {
  const finished = userItems.filter((i) => i.status === "finished");
  const highRated = finished.filter((i) => (i.userRating || i.review?.rating || 0) >= 4);

  const genreWeights: Record<string, number> = {};
  highRated.forEach((item) => {
    item.genres?.forEach((g) => {
      genreWeights[g] = (genreWeights[g] || 0) + 2;
    });
  });
  finished.forEach((item) => {
    item.genres?.forEach((g) => {
      genreWeights[g] = (genreWeights[g] || 0) + 1;
    });
  });

  // Incorporate user search affinity into daily genre weights
  const searchAffinity = typeof window !== "undefined" ? getUserSearchAffinity() : undefined;
  if (searchAffinity?.genreWeights) {
    Object.entries(searchAffinity.genreWeights).forEach(([g, w]) => {
      genreWeights[g] = (genreWeights[g] || 0) + w;
    });
  }

  const sortedUserGenres = Object.entries(genreWeights).sort((a, b) => b[1] - a[1]);
  const favoriteGenre = sortedUserGenres[0]?.[0];

  const dayOfYear = getDayOfYear();

  const finishedTitles = new Set(finished.map((i) => i.title.toLowerCase()));

  let candidateBooks = OPEN_SOURCE_BOOKS_CATALOG.filter(
    (b) => !finishedTitles.has(b.title.toLowerCase())
  );
  if (candidateBooks.length === 0) candidateBooks = OPEN_SOURCE_BOOKS_CATALOG;

  let candidateMovies = OPEN_SOURCE_MOVIES_CATALOG.filter(
    (m) => !finishedTitles.has(m.title.toLowerCase())
  );
  if (candidateMovies.length === 0) candidateMovies = OPEN_SOURCE_MOVIES_CATALOG;

  if (favoriteGenre) {
    const genreBooks = candidateBooks.filter((b) =>
      b.genres.some((g) => g.toLowerCase() === favoriteGenre.toLowerCase())
    );
    if (genreBooks.length > 0) candidateBooks = genreBooks;

    const genreMovies = candidateMovies.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === favoriteGenre.toLowerCase())
    );
    if (genreMovies.length > 0) candidateMovies = genreMovies;
  }

  const bookIndex = dayOfYear % candidateBooks.length;
  const movieIndex = (dayOfYear + 2) % candidateMovies.length;

  const book = candidateBooks[bookIndex];
  const movie = candidateMovies[movieIndex];

  let reason = "Today's literary and cinematic highlights from open-source archives.";
  if (favoriteGenre && highRated.length > 0) {
    reason = `Recommended today based on your high ratings in ${favoriteGenre}.`;
  } else if (favoriteGenre && (searchAffinity?.totalSearches || 0) > 0) {
    reason = `Recommended today based on your frequent interest in ${favoriteGenre}.`;
  } else if (highRated.length > 0) {
    reason = `Recommended today based on your previous 5-star completions.`;
  }

  return { book, movie, reason };
}

/**
 * Daily Quote Engine:
 * Preference from quotes the user saved from their read/watched titles.
 * Otherwise selects from open-source repository.
 */
export function getDailyQuote(userItems: MediaItem[]): DailyQuote {
  const userQuotes: DailyQuote[] = [];
  userItems
    .filter((i) => i.status === "finished" && i.review?.favoriteQuote)
    .forEach((item) => {
      userQuotes.push({
        quote: item.review!.favoriteQuote!,
        author: item.creator,
        work: item.title,
        type: item.type,
        year: item.releaseYear,
        fromUserCollection: true
      });
    });

  const dayOfYear = getDayOfYear();
  if (userQuotes.length > 0) {
    const todayIndex = dayOfYear % userQuotes.length;
    return userQuotes[todayIndex];
  }

  const todayIndex = dayOfYear % OPEN_SOURCE_QUOTES.length;
  return OPEN_SOURCE_QUOTES[todayIndex];
}
