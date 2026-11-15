"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Film,
  Compass,
  Bookmark,
  Sparkles,
  User,
  LogOut,
  LogIn
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { getFirebaseInstance } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { resolveTabFromPathname } from "@/lib/routes";
import { terminateAuthSession } from "@/lib/authSession";

export type NavTab = "concierge" | "library" | "theatre" | "lists" | "journey" | "completed" | "mood";

interface NavbarProps {
  activeTab?: NavTab;
  readListCount?: number;
  watchListCount?: number;
  inProgressCount?: number;
  completedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  readListCount = 0,
  watchListCount = 0,
  inProgressCount = 0,
  completedCount = 0,
}) => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const totalQueueCount = readListCount + watchListCount + inProgressCount;

  // Determine active tab automatically from URL path or override prop
  const currentTab = useMemo<NavTab>(() => {
    return activeTab || resolveTabFromPathname(pathname);
  }, [pathname, activeTab]);

  useEffect(() => {
    try {
      const { auth } = getFirebaseInstance();
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
        });
        return () => unsubscribe();
      }
    } catch {
      // Offline fallback
    }
  }, []);

  const handleSignOut = async () => {
    try {
      const { auth } = getFirebaseInstance();
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Sign out error", e);
    } finally {
      terminateAuthSession();
      setCurrentUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-md border-b border-theme-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-primary/30 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsCB3GajvxoqOQ5bTApddi2GKZR7wELSD6GHk9ig_xXkjvKDgY1_TAaJTU0n3YsGsaXdWpbRTl6_61rJJZHh911TWNEfGOxsVpkY7PaCALedHiXRz8FuF_9AKPDmWAdiV9tRxGfQ1coOwrprK2lRomOi0OJ12rJNAzBIQm-41mKlEBELIFJYa_iuqnJ-ZWRveyYVCYIE-EqUB5vNUF5XH8vqPSLWaThkaS_3S8_vfNRmyl-pBiQNrJ"
                alt="Kalp Library"
                width={44}
                height={44}
                className="w-full h-full object-cover scale-[1.35]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-brand-primary uppercase leading-none">
                Kalp Library
              </span>
              <span className="text-[10px] tracking-widest text-brand-secondary font-semibold uppercase mt-0.5 font-mono">
                Books, Cinema and More
              </span>
            </div>
          </Link>

          {/* 2. Primary Navigation Switcher */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-surface rounded-2xl border border-theme-border shadow-inner">
            {/* Concierge (Home) */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                currentTab === "concierge"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm"
                  : "text-text-muted hover:text-brand-primary hover:bg-surface-card"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Concierge</span>
            </Link>

            {/* The Library (Books) */}
            <Link
              href="/library"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                currentTab === "library"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm"
                  : "text-text-muted hover:text-brand-primary hover:bg-surface-card"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Library</span>
            </Link>

            {/* The Theater (Cinema) */}
            <Link
              href="/theater"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                currentTab === "theatre"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm"
                  : "text-text-muted hover:text-brand-primary hover:bg-surface-card"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Theater</span>
            </Link>

            {/* Watchlist & ReadList */}
            <Link
              href="/lists"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                currentTab === "lists"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm"
                  : "text-text-muted hover:text-brand-primary hover:bg-surface-card"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist & ReadList</span>
              {totalQueueCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-primary-fg/20 font-mono font-bold">
                  {totalQueueCount}
                </span>
              )}
            </Link>

            {/* Journey & Reflections */}
            <Link
              href="/journey"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                currentTab === "journey" || currentTab === "completed"
                  ? "bg-brand-primary text-brand-primary-fg shadow-sm"
                  : "text-text-muted hover:text-brand-primary hover:bg-surface-card"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Journey</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-primary-fg/20 font-mono font-bold">
                {completedCount}
              </span>
            </Link>
          </nav>

          {/* 3. Right Action Group: ThemeToggle & User Profile / Sign In */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* User Profile / Sign In */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-theme-border shadow-sm">
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-text-main leading-tight truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1 rounded-lg hover:bg-surface-card text-text-muted hover:text-rose-500 transition-colors ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-card text-brand-primary border border-theme-border text-xs font-semibold transition-all shadow-sm"
                title="Sign In"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile View Switcher Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-theme-border-subtle no-scrollbar">
          <Link
            href="/"
            className={`px-3 py-1 rounded-lg text-xs uppercase font-medium whitespace-nowrap ${
              currentTab === "concierge" ? "bg-brand-primary text-brand-primary-fg font-semibold" : "text-text-muted"
            }`}
          >
            Concierge
          </Link>
          <Link
            href="/library"
            className={`px-3 py-1 rounded-lg text-xs uppercase font-medium whitespace-nowrap ${
              currentTab === "library" ? "bg-brand-primary text-brand-primary-fg font-semibold" : "text-text-muted"
            }`}
          >
            Library
          </Link>
          <Link
            href="/theater"
            className={`px-3 py-1 rounded-lg text-xs uppercase font-medium whitespace-nowrap ${
              currentTab === "theatre" ? "bg-brand-primary text-brand-primary-fg font-semibold" : "text-text-muted"
            }`}
          >
            Theater
          </Link>
          <Link
            href="/lists"
            className={`px-3 py-1 rounded-lg text-xs uppercase font-medium whitespace-nowrap ${
              currentTab === "lists" ? "bg-brand-primary text-brand-primary-fg font-semibold" : "text-text-muted"
            }`}
          >
            Lists ({totalQueueCount})
          </Link>
          <Link
            href="/journey"
            className={`px-3 py-1 rounded-lg text-xs uppercase font-medium whitespace-nowrap ${
              currentTab === "journey" || currentTab === "completed" ? "bg-brand-primary text-brand-primary-fg font-semibold" : "text-text-muted"
            }`}
          >
            Journey ({completedCount})
          </Link>
        </div>
      </div>
    </header>
  );
};
