# Graph Report - KalpLibrary  (2026-11-15)

## Corpus Check
- 87 files · ~47,044 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 464 nodes · 1000 edges · 30 communities (14 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eefd5712`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- BookshelfView.tsx
- dependencies
- compilerOptions
- devDependencies
- library/page.tsx
- OnlineSearchSection.tsx
- moodMatcher.ts
- MediaItem
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
- TimelineSection.tsx

## God Nodes (most connected - your core abstractions)
1. `MediaItem` - 51 edges
2. `getFirebaseInstance()` - 20 edges
3. `BasePage` - 20 edges
4. `MediaType` - 18 edges
5. `ItemStatus` - 18 edges
6. `AppShell()` - 17 edges
7. `BookCover()` - 16 edges
8. `MovieCover()` - 16 edges
9. `compilerOptions` - 16 edges
10. `fireCelebration()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ConciergeContent()` --calls--> `useApp()`  [EXTRACTED]
  src/app/page.tsx → src/components/AppShell.tsx
- `BookshelfSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/BookshelfSection.tsx → src/types/index.ts
- `CinemaTicketsSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/CinemaTicketsSection.tsx → src/types/index.ts
- `MoodMatcherModalProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/MoodMatcherModal.tsx → src/types/index.ts
- `OnlineSearchSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/OnlineSearchSection.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (30 total, 11 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.07
Nodes (53): AppContextType, BookCover(), BookCoverProps, BookshelfViewProps, DetailModal(), DetailModalProps, STATUS_OPTIONS, MEDIA_TYPE_ICONS (+45 more)

### Community 1 - "BookshelfView.tsx"
Cohesion: 0.18
Nodes (18): BookshelfSection(), BookshelfSectionProps, BookshelfView(), JourneyActiveSection, CinemaTicketsSection(), CinemaTicketsSectionProps, MEDIA_ICONS, QueueListView() (+10 more)

### Community 2 - "dependencies"
Cohesion: 0.11
Nodes (19): canvas-confetti, clsx, firebase, lucide-react, next, dependencies, canvas-confetti, clsx (+11 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (32): autoprefixer, devDependencies, autoprefixer, @playwright/test, postcss, tailwindcss, @types/canvas-confetti, @types/node (+24 more)

### Community 6 - "library/page.tsx"
Cohesion: 0.14
Nodes (13): JourneyContent(), LibraryContent(), ListsContent(), TheaterContent(), useApp(), MediaCard(), computeGenreBreakdown(), BOOKSHELF_SORT_STRATEGIES (+5 more)

### Community 7 - "OnlineSearchSection.tsx"
Cohesion: 0.11
Nodes (31): GET(), OnlineSearchSection(), OnlineSearchSectionProps, SearchBar(), SearchBarProps, SuggestionItem, getStatusConfig(), generateSpineStyle() (+23 more)

### Community 8 - "moodMatcher.ts"
Cohesion: 0.36
Nodes (7): POST(), matchItemByMood(), matchWithClaude(), matchWithGemini(), matchWithLocalHeuristics(), MoodMatchParams, MoodMatchResult

### Community 9 - "MediaItem"
Cohesion: 0.08
Nodes (40): metadata, LoginPage(), AppContext, AppShell(), AppShellProps, Footer(), FooterProps, Navbar() (+32 more)

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

### Community 30 - "TimelineSection.tsx"
Cohesion: 0.27
Nodes (10): TicketStub(), TicketStubProps, TimelineSection(), TimelineSectionProps, buildTimelineEntries(), formatCompletionDate(), getItemCompletionTimestamp(), groupTimelineByPeriod() (+2 more)

## Knowledge Gaps
- **127 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 185 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MediaItem` connect `MediaItem` to `index.ts`, `BookshelfView.tsx`, `library/page.tsx`, `OnlineSearchSection.tsx`, `moodMatcher.ts`, `ConciergeView.tsx`, `TimelineSection.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `getFirebaseInstance()` connect `MediaItem` to `ConciergeView.tsx`, `OnlineSearchSection.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `BasePage` connect `BasePage` to `routes.smoke.spec.ts`, `LibraryPage`, `LoginPage`, `ConciergePage`, `TheaterPage`, `JourneyPage`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06919945725915876 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._