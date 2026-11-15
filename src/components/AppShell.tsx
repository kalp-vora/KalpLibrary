"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaItem, ItemStatus, ReviewData } from "@/types";
import { StorageService } from "@/lib/storage";
import { getFirebaseInstance } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  hasAuthSessionCookie,
  isTestAuthActive,
  establishAuthSession,
  terminateAuthSession,
  purgeLegacyUserStorage
} from "@/lib/authSession";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReviewModal } from "@/components/ReviewModal";
import { DetailModal } from "@/components/DetailModal";

interface AppContextType {
  items: MediaItem[];
  existingTitles: string[];
  readListCount: number;
  watchListCount: number;
  inProgressCount: number;
  completedCount: number;
  onAddItem: (item: MediaItem) => Promise<void>;
  onStatusChange: (item: MediaItem, newStatus: ItemStatus) => Promise<void>;
  onMarkFinished: (item: MediaItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onOpenDetail: (item: MediaItem) => void;
  onOpenReview: (item: MediaItem) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppShell");
  }
  return ctx;
}

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [itemForReview, setItemForReview] = useState<MediaItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MediaItem | null>(null);

  // 1. Session and Authentication Verification
  useEffect(() => {
    let isMounted = true;

    const checkAuth = () => {
      purgeLegacyUserStorage();

      if (!hasAuthSessionCookie()) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthChecking(false);
          window.location.href = "/login";
        }
        return;
      }

      // Check if test auth bypass is active for Playwright tests
      if (isTestAuthActive()) {
        if (isMounted) {
          setIsAuthenticated(true);
          setIsAuthChecking(false);
        }
        return;
      }

      try {
        const { auth } = getFirebaseInstance();
        if (auth) {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!isMounted) return;
            if (user) {
              establishAuthSession();
              setIsAuthenticated(true);
              setIsAuthChecking(false);
            } else {
              terminateAuthSession();
              setIsAuthenticated(false);
              setIsAuthChecking(false);
              window.location.href = "/login";
            }
          });
          return unsubscribe;
        } else {
          if (isMounted) {
            terminateAuthSession();
            setIsAuthenticated(false);
            setIsAuthChecking(false);
            window.location.href = "/login";
          }
        }
      } catch {
        if (isMounted) {
          terminateAuthSession();
          setIsAuthenticated(false);
          setIsAuthChecking(false);
          window.location.href = "/login";
        }
      }
    };

    const unsubscribe = checkAuth();
    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [router]);

  // 2. React Query data fetch
  const { data: items = [] } = useQuery<MediaItem[]>({
    queryKey: ["mediaItems"],
    queryFn: () => StorageService.getLocalItems(),
  });

  // 3. Realtime storage sync
  useEffect(() => {
    const unsubscribe = StorageService.subscribe((updatedItems) => {
      queryClient.setQueryData(["mediaItems"], updatedItems);
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Derived counts
  const readListCount = useMemo(
    () => items.filter((i) => i.type === "book" && i.status === "to_experience").length,
    [items]
  );
  const watchListCount = useMemo(
    () => items.filter((i) => (i.type === "movie" || i.type === "tv" || i.type === "anime") && i.status === "to_experience").length,
    [items]
  );
  const inProgressCount = useMemo(
    () => items.filter((i) => i.status === "in_progress").length,
    [items]
  );
  const completedCount = useMemo(
    () => items.filter((i) => i.status === "finished").length,
    [items]
  );

  const existingTitles = useMemo(() => items.map((i) => i.title), [items]);

  // Mutations
  const saveItemMutation = useMutation({
    mutationFn: (newItem: MediaItem) => StorageService.saveItem(newItem),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mediaItems"] }),
  });

  const statusChangeMutation = useMutation({
    mutationFn: ({ item, newStatus }: { item: MediaItem; newStatus: ItemStatus }) =>
      StorageService.saveItem({ ...item, status: newStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mediaItems"] }),
  });

  const saveReviewMutation = useMutation({
    mutationFn: ({ item, review }: { item: MediaItem; review: ReviewData }) =>
      StorageService.saveItem({
        ...item,
        status: "finished",
        userRating: review.rating,
        review,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mediaItems"] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => StorageService.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mediaItems"] }),
  });

  const handleAddItem = async (item: MediaItem) => {
    await saveItemMutation.mutateAsync(item);
  };

  const handleStatusChange = async (item: MediaItem, newStatus: ItemStatus) => {
    await statusChangeMutation.mutateAsync({ item, newStatus });
  };

  const handleMarkFinished = (item: MediaItem) => {
    setItemForReview(item);
    setIsReviewModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItemMutation.mutateAsync(id);
  };

  const handleOpenDetail = (item: MediaItem) => {
    setSelectedItemForDetail(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenReview = (item: MediaItem) => {
    setItemForReview(item);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (item: MediaItem, review: ReviewData) => {
    await saveReviewMutation.mutateAsync({ item, review });
    setIsReviewModalOpen(false);
    setItemForReview(null);
  };

  const handleColorChange = (item: MediaItem, color: string) => {
    const updatedItem: MediaItem = {
      ...item,
      spineStyle: {
        ...item.spineStyle,
        color,
        textColor: (color === "#EAE2D1" ? "dark" : "light") as "dark" | "light",
        thicknessPx: item.spineStyle?.thicknessPx || 34,
        heightPercent: item.spineStyle?.heightPercent || 95,
        accentColor: item.spineStyle?.accentColor || "#E6C687",
      },
    };
    setSelectedItemForDetail(updatedItem);
    saveItemMutation.mutate(updatedItem);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground font-sans">
        <div className="w-14 h-14 rounded-full overflow-hidden border border-brand-primary/30 flex items-center justify-center p-0.5 mb-3 shadow-md animate-pulse">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsCB3GajvxoqOQ5bTApddi2GKZR7wELSD6GHk9ig_xXkjvKDgY1_TAaJTU0n3YsGsaXdWpbRTl6_61rJJZHh911TWNEfGOxsVpkY7PaCALedHiXRz8FuF_9AKPDmWAdiV9tRxGfQ1coOwrprK2lRomOi0OJ12rJNAzBIQm-41mKlEBELIFJYa_iuqnJ-ZWRveyYVCYIE-EqUB5vNUF5XH8vqPSLWaThkaS_3S8_vfNRmyl-pBiQNrJ"
            alt="Kalp Library"
            width={56}
            height={56}
            className="w-full h-full object-cover scale-[1.35]"
          />
        </div>
        <div className="font-serif text-lg font-bold text-foreground">
          Kalp Library
        </div>
        <p className="text-xs text-text-muted mt-1">Opening your collection...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const contextValue: AppContextType = {
    items,
    existingTitles,
    readListCount,
    watchListCount,
    inProgressCount,
    completedCount,
    onAddItem: handleAddItem,
    onStatusChange: handleStatusChange,
    onMarkFinished: handleMarkFinished,
    onDeleteItem: handleDeleteItem,
    onOpenDetail: handleOpenDetail,
    onOpenReview: handleOpenReview,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand-secondary/30 selection:text-brand-primary">
        <Navbar
          readListCount={readListCount}
          watchListCount={watchListCount}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
        />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>

        <Footer />

        {/* Global Review Modal */}
        {itemForReview && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            item={itemForReview}
            onClose={() => {
              setIsReviewModalOpen(false);
              setItemForReview(null);
            }}
            onSaveReview={handleSaveReview}
          />
        )}

        {/* Global Detail Modal */}
        {selectedItemForDetail && (
          <DetailModal
            isOpen={isDetailModalOpen}
            item={selectedItemForDetail}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedItemForDetail(null);
            }}
            onStatusChange={handleStatusChange}
            onOpenReview={handleOpenReview}
            onDelete={handleDeleteItem}
            onColorChange={handleColorChange}
          />
        )}
      </div>
    </AppContext.Provider>
  );
};
