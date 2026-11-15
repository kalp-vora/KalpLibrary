# Graph Report - KalpLibrary  (2026-11-15)

## Corpus Check
- 85 files · ~43,667 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 455 nodes · 946 edges · 30 communities (14 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- MediaItem
- BookshelfView.tsx
- dependencies
- compilerOptions
- devDependencies
- AppShell.tsx
- library/page.tsx
- OnlineSearchSection.tsx
- moodMatcher.ts
- ThemeContext.tsx
- next.config.ts
- ConciergeView.tsx
- tailwind.config.ts
- AGENTS.md — Agent Directives & Engineering Standards
- Kalp Library — Firestore Database Architecture & Schema Specification
- 🚀 Getting Started
- proxy.ts
- DetailModalPom
- routes.smoke.spec.ts
- LibraryPage
- LoginPage
- ConciergePage
- BasePage
- TheaterPage
- JourneyPage

## God Nodes (most connected - your core abstractions)
1. `MediaItem` - 51 edges
2. `getFirebaseInstance()` - 20 edges
3. `BasePage` - 20 edges
4. `MediaType` - 18 edges
5. `AppShell()` - 16 edges
6. `BookCover()` - 16 edges
7. `MovieCover()` - 16 edges
8. `ItemStatus` - 16 edges
9. `compilerOptions` - 16 edges
10. `fireCelebration()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ConciergeContent()` --calls--> `useApp()`  [EXTRACTED]
  src/app/page.tsx → src/components/AppShell.tsx
- `BookshelfSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/BookshelfSection.tsx → src/types/index.ts
- `BookshelfViewProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/BookshelfView.tsx → src/types/index.ts
- `CinemaTicketsSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/CinemaTicketsSection.tsx → src/types/index.ts
- `OnlineSearchSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/OnlineSearchSection.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (30 total, 11 thin omitted)

### Community 0 - "MediaItem"
Cohesion: 0.07
Nodes (54): AppContextType, BookCover(), BookCoverProps, DetailModal(), DetailModalProps, STATUS_OPTIONS, MEDIA_TYPE_ICONS, MediaCard() (+46 more)

### Community 1 - "BookshelfView.tsx"
Cohesion: 0.13
Nodes (23): BookshelfSection(), BookshelfSectionProps, BookshelfView(), BookshelfViewProps, JourneyActiveSection, CinemaTicketsSection(), CinemaTicketsSectionProps, TicketStub() (+15 more)

### Community 2 - "dependencies"
Cohesion: 0.11
Nodes (19): canvas-confetti, clsx, firebase, lucide-react, next, dependencies, canvas-confetti, clsx (+11 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (31): autoprefixer, devDependencies, autoprefixer, @playwright/test, postcss, tailwindcss, @types/canvas-confetti, @types/node (+23 more)

### Community 5 - "AppShell.tsx"
Cohesion: 0.09
Nodes (31): LoginPage(), AppContext, AppShell(), AppShellProps, Footer(), FooterProps, Navbar(), NavbarProps (+23 more)

### Community 6 - "library/page.tsx"
Cohesion: 0.13
Nodes (13): JourneyContent(), LibraryContent(), ListsContent(), TheaterContent(), useApp(), QueueListView(), computeGenreBreakdown(), BOOKSHELF_SORT_STRATEGIES (+5 more)

### Community 7 - "OnlineSearchSection.tsx"
Cohesion: 0.11
Nodes (30): GET(), OnlineSearchSection(), OnlineSearchSectionProps, SearchBar(), SearchBarProps, SuggestionItem, generateSpineStyle(), getCuratedBookFallback() (+22 more)

### Community 8 - "moodMatcher.ts"
Cohesion: 0.43
Nodes (6): POST(), matchItemByMood(), matchWithClaude(), matchWithGemini(), matchWithLocalHeuristics(), MoodMatchParams

### Community 9 - "ThemeContext.tsx"
Cohesion: 0.19
Nodes (9): metadata, QueryProvider(), ThemeToggle(), ThemeToggleProps, Theme, ThemeContext, ThemeContextType, ThemeProvider() (+1 more)

### Community 11 - "ConciergeView.tsx"
Cohesion: 0.11
Nodes (24): ConciergeContent(), ConciergeView(), ConciergeViewProps, ITEM_STATUS_TO_QUEUE_KEY, NavTab, copyToClipboard(), SearchResultItem, DailyQuote (+16 more)

### Community 14 - "AGENTS.md — Agent Directives & Engineering Standards"
Cohesion: 0.15
Nodes (12): 1. Codebase Exploration: Graphify First (Never Random Grepping), 2. Coding Philosophy: Ponytail Protocol (Lazy Senior Dev), 3. Technology Stack & Next.js Architecture, 4. Data Sources & APIs: 100% Open-Source & Free for Usage, 5. Architectural Integrity & Design Patterns Over Quick Patches, 6. Separation of Concerns: Dedicated Utility Modules Over TSX Inlining, 7. Reusable UI Components & Debounced Auto-Search (DRY Standard), AGENTS.md — Agent Directives & Engineering Standards (+4 more)

### Community 15 - "Kalp Library — Firestore Database Architecture & Schema Specification"
Cohesion: 0.22
Nodes (8): 1. High-Level Entity Relationship Model, 2. Document Specifications, 3. Security Rules (`firestore.rules`), 4. Composite Indexes (`firestore.indexes.json`), Kalp Library — Firestore Database Architecture & Schema Specification, `users/{userId}`, `users/{userId}/library_items/{itemId}`, `users/{userId}/library_items/{itemId}/episodes/{episodeId}` (Extensibility Subcollection)

### Community 16 - "🚀 Getting Started"
Cohesion: 0.29
Nodes (6): 1. Install Dependencies, 2. Run the Development Server, 3. Optional: Configure Firebase & AI Keys, ✨ Features, 🚀 Getting Started, Kalp Library — Books, Films & Curated Thoughts 📚🎬

## Knowledge Gaps
- **125 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 185 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MediaItem` connect `MediaItem` to `BookshelfView.tsx`, `AppShell.tsx`, `library/page.tsx`, `OnlineSearchSection.tsx`, `moodMatcher.ts`, `ConciergeView.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `getFirebaseInstance()` connect `AppShell.tsx` to `ThemeContext.tsx`, `ConciergeView.tsx`, `OnlineSearchSection.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `MediaType` connect `MediaItem` to `ConciergeView.tsx`, `OnlineSearchSection.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MediaItem` be split into smaller, more focused modules?**
  _Cohesion score 0.07289002557544758 - nodes in this community are weakly interconnected._
- **Should `BookshelfView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1310344827586207 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._