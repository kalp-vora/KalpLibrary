"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseInstance } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // 1. Read stored theme preference or fall back to dark
    const stored = localStorage.getItem("kalp_theme") as Theme | null;
    const initialTheme: Theme = stored === "light" ? "light" : "dark";
    setThemeState(initialTheme);
    applyThemeClass(initialTheme);

    // 2. Sync from Firestore if authenticated
    try {
      const { auth, db } = getFirebaseInstance();
      if (auth && db) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userRef = doc(db, "users", user.uid);
              const snapshot = await getDoc(userRef);
              if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.themePreference === "dark" || data.themePreference === "light") {
                  setThemeState(data.themePreference);
                  localStorage.setItem("kalp_theme", data.themePreference);
                  applyThemeClass(data.themePreference);
                }
              }
            } catch (err) {
              console.warn("Failed to load user theme from Firestore:", err);
            }
          }
        });
        return () => unsubscribe();
      }
    } catch (e) {
      // Offline fallback
    }
  }, []);

  const applyThemeClass = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem("kalp_theme", nextTheme);
    applyThemeClass(nextTheme);

    // Persist to Firestore if user is authenticated
    try {
      const { auth, db } = getFirebaseInstance();
      if (auth?.currentUser && db) {
        setDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            themePreference: nextTheme,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    } catch {
      // Local fallback only
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
