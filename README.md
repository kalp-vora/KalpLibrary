# Kalp Library — Books, Films & Curated Thoughts 📚🎬

An intelligent, unified personal media library built with **Next.js (App Router)**, **Tailwind CSS**, and **Firebase (Firestore & Cloud Sync)**.

Designed for readers and cinephiles who keep adding titles to backlogs and need a beautiful, frictionless sanctuary to discover, track, journal, and celebrate what they consume.

---

## ✨ Features

1. **Books & Movies in One Unified Place**
   - Seamless switching between Books, Movies, TV Series, or your entire collection.
   - Filter by status: *To Experience*, *In Progress*, or *Finished*.

2. **Claude AI Cultural Research**
   - Enter any title (e.g. *Project Hail Mary*, *Severance*, *Dune*, *The Midnight Library*).
   - Claude / AI analyzes and extracts:
     - Accurate plot synopsis and narrative hook
     - Creators (author, director, cast)
     - Runtime / Page count / Release year
     - Official artwork / cover posters
     - Cultural importance ("Why It's Notable")
     - Atmospheric vibes & mood tags (e.g. *Mind-bending*, *Poignant*, *Whimsical*, *Cozy*)
     - Custom bookshelf spine styling

3. **Emotional Oracle (Mood Matcher)**
   - Feeling exhausted after a long day? Want a late-night reality-bending puzzle? Or looking for a tender tearjerker?
   - Describe your mood in natural language or pick a vibe chip.
   - The AI evaluates your unread / unwatched queue and delivers the #1 personalized recommendation with an explanation of why it fits your current mental bandwidth and emotional rhythm.

4. **Multi-Dimensional Filtering & Sorting**
   - Filter by category: Books vs Movies vs TV Shows.
   - Multi-select interactive genre pills with live item counters.
   - Filter by rating (3★+, 4★+, 5★).
   - Instant search across titles, authors, directors, themes, and personal notes.
   - Sort by Date Added, Community Rating, Release Year, or Title.

5. **Completion Reflections & Journaling**
   - When you finish any title, record your thoughts:
     - 5-Star rating & Date completed
     - **Key Takeaways & Life Lessons**: The central insight that will stay with you forever.
     - **Unfiltered Thoughts**: Your personal review.
     - **Memorable Quote or Scene**: Words worth remembering.
     - Confetti celebration upon completion!

6. **The Growing Shelf (Permanent 3D Bookshelf View)**
   - Every completed book and film takes its place on an ever-growing wooden bookshelf.
   - Textured 3D spines with gold foil embossing, proportional thickness (based on page count / runtime), and bookmark ribbons.
   - Interactive: Hover pulls the book forward; click pulls it off the shelf into a reading card revealing your reflections and takeaways.
   - Live Shelf Metrics: Total titles finished, pages read, watch hours, and scholar rank.

7. **Persistence with Firebase Firestore + Offline Local Fallback**
   - Real-time cloud synchronization with Firebase Firestore (`media_items` collection).
   - Built-in instant offline / local storage persistence: works immediately out of the box with sample data even without Firebase credentials!
   - Full Settings UI to paste your Firebase credentials or AI keys (Anthropic / Gemini).
   - JSON export and import for local backups.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Optional: Configure Firebase & AI Keys
You can set them in `.env.local` or directly within the **Settings modal** in the web app:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Claude / Gemini API Keys
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```
*(Even without API keys, Kalp Library works out of the box using public OpenLibrary & Apple Media cultural archives and built-in semantic analysis!)*

