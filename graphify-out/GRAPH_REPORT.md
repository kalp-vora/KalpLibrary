# Graph Report - KalpLibrary  (2026-11-15)

## Corpus Check
- 87 files · ~47,607 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 465 nodes · 999 edges · 29 communities (13 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50d13e19`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- MediaItem
- TimelineSection.tsx
- dependencies
- compilerOptions
- devDependencies
- moodMatcher.ts
- BookshelfView.tsx
- OnlineSearchSection.tsx
- AppShell.tsx
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
- `OnlineSearchSectionProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/OnlineSearchSection.tsx → src/types/index.ts
- `SearchBarProps` --references--> `MediaType`  [EXTRACTED]
  src/components/SearchBar.tsx → src/types/index.ts
- `TicketStubProps` --references--> `MediaItem`  [EXTRACTED]
  src/components/TicketStub.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (29 total, 11 thin omitted)

### Community 0 - "MediaItem"
Cohesion: 0.07
Nodes (65): AppContextType, BookCover(), BookCoverProps, BookshelfViewProps, CinemaTicketsSection(), CinemaTicketsSectionProps, DetailModal(), DetailModalProps (+57 more)

### Community 1 - "TimelineSection.tsx"
Cohesion: 0.27
Nodes (10): TicketStub(), TicketStubProps, TimelineSection(), TimelineSectionProps, buildTimelineEntries(), formatCompletionDate(), getItemCompletionTimestamp(), groupTimelineByPeriod() (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.11
Nodes (19): canvas-confetti, clsx, firebase, lucide-react, next, dependencies, canvas-confetti, clsx (+11 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (32): autoprefixer, devDependencies, autoprefixer, @playwright/test, postcss, tailwindcss, @types/canvas-confetti, @types/node (+24 more)

### Community 5 - "moodMatcher.ts"
Cohesion: 0.43
Nodes (6): POST(), matchItemByMood(), matchWithClaude(), matchWithGemini(), matchWithLocalHeuristics(), MoodMatchParams

### Community 6 - "BookshelfView.tsx"
Cohesion: 0.11
Nodes (22): JourneyContent(), LibraryContent(), ListsContent(), TheaterContent(), useApp(), BookshelfSection(), BookshelfSectionProps, BookshelfView() (+14 more)

### Community 7 - "OnlineSearchSection.tsx"
Cohesion: 0.10
Nodes (32): GET(), OnlineSearchSection(), OnlineSearchSectionProps, SearchBar(), SearchBarProps, getStatusConfig(), generateSpineStyle(), getCuratedBookFallback() (+24 more)

### Community 9 - "AppShell.tsx"
Cohesion: 0.07
Nodes (39): metadata, LoginPage(), AppContext, AppShell(), AppShellProps, Footer(), FooterProps, Navbar() (+31 more)

### Community 11 - "ConciergeView.tsx"
Cohesion: 0.12
Nodes (23): ConciergeContent(), ConciergeView(), ConciergeViewProps, ITEM_STATUS_TO_QUEUE_KEY, NavTab, copyToClipboard(), SearchResultItem, GENRE_PROFILES (+15 more)

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
- **127 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 185 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MediaItem` connect `MediaItem` to `TimelineSection.tsx`, `moodMatcher.ts`, `BookshelfView.tsx`, `OnlineSearchSection.tsx`, `AppShell.tsx`, `ConciergeView.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `getFirebaseInstance()` connect `AppShell.tsx` to `ConciergeView.tsx`, `OnlineSearchSection.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `BasePage` connect `BasePage` to `routes.smoke.spec.ts`, `LibraryPage`, `LoginPage`, `ConciergePage`, `TheaterPage`, `JourneyPage`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MediaItem` be split into smaller, more focused modules?**
  _Cohesion score 0.06564287865100873 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._