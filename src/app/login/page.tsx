"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { getFirebaseInstance } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { establishAuthSession, purgeLegacyUserStorage } from "@/lib/authSession";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // If already authenticated, redirect to main application
  useEffect(() => {
    purgeLegacyUserStorage();

    try {
      const { auth } = getFirebaseInstance();
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            establishAuthSession();
            window.location.href = "/";
          }
        });
        return () => unsubscribe();
      }
    } catch {
      // offline fallback
    }
  }, []);

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAlertMessage({ text: "Opening secure Google authentication...", type: "info" });

    try {
      const { auth, db } = getFirebaseInstance();
      if (auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const name = result.user.displayName || "Reader";

        // 1. Immediately establish authenticated session
        establishAuthSession();

        // 2. Persist user profile & theme preference to Firestore in background
        if (db) {
          const currentTheme = (localStorage.getItem("kalp_theme") as "dark" | "light") || "dark";
          setDoc(
            doc(db, "users", result.user.uid),
            {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              themePreference: currentTheme,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((err) => console.warn("User profile sync error:", err));
        }

        setAlertMessage({ text: `Welcome, ${name}! Redirecting to your sanctuary...`, type: "success" });
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
        return;
      }
    } catch (err: any) {
      console.warn("Firebase Google auth:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        let msg = err.message || "Google sign-in error";
        if (err.code === "auth/configuration-not-found") {
          msg = "Google Sign-In is not enabled yet in your Firebase Console. Please verify Authentication > Sign-in method, or sign in with email.";
        }
        setAlertMessage({ text: msg, type: "error" });
        setLoading(false);
        return;
      }
    }

    // Guest fallback if Firebase credentials are offline
    try {
      establishAuthSession();
      setAlertMessage({ text: "Welcome to Kalp Library! Loading your collection...", type: "success" });
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) return;

    setLoading(true);
    setAlertMessage({ text: "Verifying credentials... Welcome back.", type: "info" });

    try {
      const { auth, db } = getFirebaseInstance();
      if (auth) {
        const userCred = await signInWithEmailAndPassword(auth, signInEmail.trim(), signInPassword);
        const name = userCred.user.displayName || userCred.user.email?.split("@")[0] || "Reader";

        // 1. Immediately establish authenticated session
        establishAuthSession();

        // 2. Persist user profile & theme preference to Firestore in background
        if (db) {
          const currentTheme = (localStorage.getItem("kalp_theme") as "dark" | "light") || "dark";
          setDoc(
            doc(db, "users", userCred.user.uid),
            {
              uid: userCred.user.uid,
              email: userCred.user.email,
              displayName: userCred.user.displayName,
              themePreference: currentTheme,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((err) => console.warn("User profile sync error:", err));
        }

        setAlertMessage({ text: `Welcome back, ${name}! Opening your collection...`, type: "success" });
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
        return;
      }
    } catch (err: any) {
      console.warn("Firebase email sign-in:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setAlertMessage({ text: "Invalid email or password. Please check credentials.", type: "error" });
        setLoading(false);
        return;
      }
    }

    // Local fallback
    establishAuthSession();
    setAlertMessage({ text: "Welcome back to Kalp Library!", type: "success" });
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
    setLoading(false);
  };

  // Handle Account Creation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword) return;

    if (regPassword !== regConfirmPassword) {
      setAlertMessage({ text: "Passwords do not match. Please verify your password.", type: "error" });
      return;
    }

    if (regPassword.length < 6) {
      setAlertMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    setLoading(true);
    setAlertMessage({ text: "Creating account... Preparing your collection...", type: "info" });

    try {
      const { auth, db } = getFirebaseInstance();
      if (auth) {
        const userCred = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
        const name = regFullName.trim() || userCred.user.email?.split("@")[0] || "Reader";
        if (regFullName.trim() && userCred.user) {
          await updateProfile(userCred.user, { displayName: regFullName.trim() });
        }

        // 1. Immediately establish authenticated session
        establishAuthSession();

        // 2. Initialize user profile & theme preference in Firestore in background
        if (db) {
          const currentTheme = (localStorage.getItem("kalp_theme") as "dark" | "light") || "dark";
          setDoc(
            doc(db, "users", userCred.user.uid),
            {
              uid: userCred.user.uid,
              email: userCred.user.email,
              displayName: name,
              themePreference: currentTheme,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((err) => console.warn("User profile init error:", err));
        }

        setAlertMessage({
          text: `Account created successfully! Welcome, ${name}.`,
          type: "success"
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
        return;
      }
    } catch (err: any) {
      console.warn("Firebase register error:", err);
      if (err.code === "auth/email-already-in-use") {
        setAlertMessage({ text: "This email is already registered. Please sign in instead.", type: "error" });
        setLoading(false);
        return;
      }
    }

    // Local fallback
    establishAuthSession();
    setAlertMessage({ text: "Account created successfully! Welcome to Kalp Library.", type: "success" });
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
    setLoading(false);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between py-3 px-4 sm:px-6 relative select-none font-sans bg-background text-text-main transition-colors duration-300">
      {/* Dynamic Ambient Background Glows */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at 50% 15%, var(--glow-top) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-8 right-8 w-80 h-80 rounded-full pointer-events-none -z-10 blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, var(--glow-bottom) 0%, transparent 70%)",
        }}
      />

      {/* Floating Theme Toggle (Top-Right) */}
      <ThemeToggle className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30" />

      {/* Center Auth Experience (Fitted to Screen with Enhanced Proportions) */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-xl mx-auto z-10 py-1">
        {/* Header with Enlarged Logo & Oneliner */}
        <div className="flex flex-col items-center text-center mb-3 sm:mb-4 shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex items-center justify-center p-2 mb-2 transition-transform duration-300 hover:scale-105 border-2 border-brand-primary dark:border-text-main bg-surface shadow-theme-card">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsCB3GajvxoqOQ5bTApddi2GKZR7wELSD6GHk9ig_xXkjvKDgY1_TAaJTU0n3YsGsaXdWpbRTl6_61rJJZHh911TWNEfGOxsVpkY7PaCALedHiXRz8FuF_9AKPDmWAdiV9tRxGfQ1coOwrprK2lRomOi0OJ12rJNAzBIQm-41mKlEBELIFJYa_iuqnJ-ZWRveyYVCYIE-EqUB5vNUF5XH8vqPSLWaThkaS_3S8_vfNRmyl-pBiQNrJ"
                alt="Kalp Tree Logo"
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover scale-[1.4]"
              />
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight text-brand-primary dark:text-text-main">
            Welcome to Kalp Library
          </h1>
          <p className="text-xs sm:text-sm max-w-md mx-auto mt-1 leading-snug text-text-muted">
            Your personal store for your watched movies, books, and wishlist.
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full rounded-2xl p-5 sm:p-6 md:p-7 relative transition-all duration-300 border border-theme-border bg-surface-card text-text-main shadow-theme-card backdrop-blur-md shrink-0">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl mb-3 sm:mb-4 border border-theme-border bg-surface">
            <button
              onClick={() => {
                setActiveTab("signin");
                setAlertMessage(null);
              }}
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "signin"
                  ? "bg-brand-accent text-brand-accent-fg shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("register");
                setAlertMessage(null);
              }}
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-brand-accent text-brand-accent-fg shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Google One-Click Auth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-theme-border hover:border-brand-primary/50 bg-surface hover:bg-surface-card text-text-main font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm active:scale-[0.99]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-2.5 sm:my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-theme-border-subtle" />
            </div>
            <div className="relative flex justify-center text-center">
              <span className="px-3 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase bg-surface-card text-text-subtle">
                or with email
              </span>
            </div>
          </div>

          {/* Sign In Form */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-1 text-left">
                <label
                  className="text-xs font-semibold tracking-wider flex items-center gap-1.5 text-brand-primary"
                  htmlFor="signInEmail"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </label>
                <input
                  id="signInEmail"
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="reader@kalp.library"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-theme-input-border bg-theme-input text-text-main placeholder-text-subtle focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <label
                    className="text-xs font-semibold tracking-wider flex items-center gap-1.5 text-brand-primary"
                    htmlFor="signInPassword"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setAlertMessage({
                        text: "Password reset instructions can be configured in your Firebase Auth console.",
                        type: "info"
                      })
                    }
                    className="text-[11px] text-text-subtle hover:text-brand-primary underline decoration-brand-primary/40 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="signInPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm border border-theme-input-border bg-theme-input text-text-main placeholder-text-subtle focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-brand-primary transition-colors"
                    title="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>{loading ? "Verifying..." : "Sign In to Kalp Library"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-2.5">
              <div className="space-y-1 text-left">
                <label
                  className="text-xs font-semibold tracking-wider flex items-center gap-1.5 text-brand-primary"
                  htmlFor="regFullName"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Full Name</span>
                </label>
                <input
                  id="regFullName"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Kalp Vora"
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-theme-input-border bg-theme-input text-text-main placeholder-text-subtle focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-1 text-left">
                <label
                  className="text-xs font-semibold tracking-wider flex items-center gap-1.5 text-brand-primary"
                  htmlFor="regEmail"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </label>
                <input
                  id="regEmail"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="reader@kalp.library"
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-theme-input-border bg-theme-input text-text-main placeholder-text-subtle focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-left">
                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold tracking-wider flex items-center gap-1.5 text-brand-primary"
                    htmlFor="regPassword"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="regPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 pr-8 rounded-xl text-xs sm:text-sm border border-theme-input-border bg-theme-input text-text-main placeholder-text-subtle focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-brand-primary"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold tracking-wider flex items-center gap-1.5 text-brand-primary"
                    htmlFor="regConfirmPassword"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </label>
                  <div className="relative">
                    <input
                      id="regConfirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      className="w-full px-3 py-2 pr-8 rounded-xl text-xs sm:text-sm border border-theme-input-border bg-theme-input text-text-main placeholder-text-subtle focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-brand-primary"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>{loading ? "Creating Account..." : "Create Account"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Status Alert Message with High-Contrast Vivid Badges */}
          {alertMessage && (
            <div
              role="alert"
              className={`mt-2.5 p-3 rounded-xl border-2 text-xs flex items-center gap-2.5 transition-all duration-200 shadow-md ${
                alertMessage.type === "error"
                  ? "bg-rose-500/15 dark:bg-[#3d0f15] border-rose-500 text-rose-700 dark:text-rose-200 shadow-rose-950/40"
                  : alertMessage.type === "success"
                  ? "bg-emerald-500/15 dark:bg-[#0d3320] border-emerald-500 text-emerald-800 dark:text-emerald-200"
                  : "bg-amber-500/15 dark:bg-[#332200] border-amber-500 text-amber-900 dark:text-amber-200"
              }`}
            >
              {alertMessage.type === "error" && (
                <XCircle className="w-4 h-4 flex-shrink-0 text-rose-500 stroke-[2.5]" />
              )}
              {alertMessage.type === "success" && (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500 stroke-[2.5]" />
              )}
              {alertMessage.type === "info" && (
                <Info className="w-4 h-4 flex-shrink-0 text-amber-500 stroke-[2.5]" />
              )}
              <span className="font-medium leading-snug">{alertMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Attribution */}
      <Footer className="py-1" />
    </div>
  );
}
