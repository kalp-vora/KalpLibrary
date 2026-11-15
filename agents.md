# AGENTS.md — Agent Directives & Engineering Standards

## 1. Codebase Exploration: Graphify First (Never Random Grepping)

**Rule:** For any question about the codebase, its architecture, file relationships, control flow, or project content, you **MUST** use `graphify`. Do NOT randomly search or grep (`rep`, arbitrary `findstr`, shotgun file scanning).

### Exploration Protocol:
- **Existing Graph**: Always check whether `graphify-out/graph.json` exists in the project root.
- **Query Traversal**: Run `/graphify query "<question>"` (or use BFS/DFS graph traversal) to understand context, god nodes, dependencies, and community boundaries.
- **Trace Paths**: When investigating relationships between two modules (e.g. Firebase vs StorageService or React Query vs API routes), use `/graphify path "<Source>" "<Target>"`.
- **Explain Nodes**: Use `/graphify explain "<Node>"` for architectural summaries.
- **Update Graph**: When new files or modules are created, run `/graphify --update` to maintain the dependency graph.

---

## 2. Coding Philosophy: Ponytail Protocol (Lazy Senior Dev)

**Rule:** Every code change MUST follow the **Ponytail** principle. The best code is the code never written.

### The Ladder (stop at the first rung that holds):
1. **Does this need to exist at all?** (YAGNI) If speculative, skip it.
2. **Already in this codebase?** Look before you write. Reuse existing types, helpers, and utils.
3. **Stdlib / Built-in does it?** Use native JavaScript/TypeScript/Web APIs before custom wrappers.
4. **Native platform feature covers it?** CSS over JS, native elements (`<input type="date">`, `<dialog>`) over third-party component bloat.
5. **Already-installed dependency solves it?** Use what is in `package.json` (Next.js, `@tanstack/react-query`, `firebase`, `lucide-react`). Never add a package for what 5 lines can do.
6. **Can it be one line?** Keep it one line.
7. **Only then:** Write the absolute minimum code that works.

### Constraints:
- No unrequested abstractions: no single-use factories, interfaces with only one implementer, or speculative scaffolding.
- Shortest working diff wins. Boring code over clever code.
- Mark any deliberate simplifications with `# ponytail:` or `// ponytail:` comment.
- **Zero Dead Code & Unused Imports**: No unused imports, unused variables, orphaned functions, or dead code should ever be left behind. Clean and prune all imports and unused logic immediately after refactoring.
- **Icon Standard (Lucide React)**: Always give strict preference to `lucide-react` icons instead of manually creating or embedding custom SVGs. Use official `lucide-react` icons across all UI components.

---

## 3. Technology Stack & Next.js Architecture

- **Next.js Version**: `16.4.6`
- **Router**: **App Router** (`src/app/`, Server Components by default, Client Components with `"use client"` only where state/hooks are needed).
- **Bundler & Dev Server**: **Turbopack** (`next dev --turbopack`).
- **Data Fetching & State**: **TanStack Query (`@tanstack/react-query`)** via `QueryClientProvider` for async data, caching, query invalidation, and mutations.
- **Persistence**: Firebase Firestore + LocalStorage fallback (`StorageService`).

---

## 4. Data Sources & APIs: 100% Open-Source & Free for Usage

**Rule:** All data sources, book/movie catalogs, recommendation queries, quote providers, and external fetch endpoints must be **100% open-source and free for usage** (e.g., Open Library, Project Gutenberg, Wikiquote / public open repositories, TVMaze, Internet Archive). Never introduce paid API keys or closed-source gated endpoints into the public app.

---

## 5. Architectural Integrity & Design Patterns Over Quick Patches

**Rule:** Always adhere to established software engineering principles (SOLID, Open-Closed Principle, Dictionary/Strategy Map Pattern, Single Source of Truth) rather than procedural `if-else-if` ladders or brittle switch cases.
- **Lookup & Strategy Maps**: For routing, tab navigation, media types, and status transitions, use typed lookup maps (`Record<Key, Value>`) instead of repetitive `if-else-if` branching.
- **Long-Term Architectural Solutions**: Diagnose systemic root causes and provide resilient, scalable long-term fixes rather than quick temporary hacks. Clarify design trade-offs with the user when multiple valid architectural approaches exist.

---

## 6. Separation of Concerns: Dedicated Utility Modules Over TSX Inlining

**Rule:** TSX files must remain focused strictly on presentation, layout, user interaction, and component state hooks. Never mix and bloat TSX files with inline utility functions, mathematical calculations, string formatters, cookie/session management, or data transformations.
- **Dedicated Utility Modules**: Extract all helper logic, calculations, cookie/auth session handlers, and formatters into dedicated modules under `src/lib/` (e.g. `authSession.ts`, `mediaMetrics.ts`, `searchFilters.ts`, `timeHelpers.ts`).
- **Single Responsibility & Pure Functions**: Utility functions should be pure, modular, reusable, and independently testable with typed inputs and return types.
- **Lean, Declarative TSX**: TSX components must import and invoke clean utilities rather than implementing multi-line algorithms or inline data manipulation.

---

## 7. Reusable UI Components & Debounced Auto-Search (DRY Standard)

**Rule:** Never duplicate search inputs, filters, or form components across multiple views (e.g. Library, Theater, Lists). Always build and reuse unified shared components under `src/components/` (such as `SearchBar.tsx`).
- **Debounced Keystroke Auto-Search & Suggestions**: For interactive search bars, always implement a standard 500ms debounce on keystroke to provide smooth auto-suggestions and avoid excessive API/database calls while typing.
- **Unified Component Reuse**: Shared features like clear buttons, keyboard navigation (Enter/Escape/Arrows), auto-suggestion dropdowns, and loading spinners must live in the shared component, not duplicated in individual pages.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
