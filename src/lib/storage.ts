import { MediaItem } from "@/types";
import { isSampleItem } from "./sampleData";
import { getFirebaseInstance, isFirebaseConfigured } from "./firebase";
import { isSameMediaItem, deduplicateMediaItems } from "./searchFilters";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

const STORAGE_KEY = "kalp_library_items_v1";

export class StorageService {
  private static localSubscribers: Set<(items: MediaItem[]) => void> = new Set();
  private static firestoreUnsubscribe: (() => void) | null = null;
  private static isListeningToFirestore = false;

  // Read all items from localStorage (purging any legacy sample data)
  static getLocalItems(): MediaItem[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed: MediaItem[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Filter out any legacy sample/dummy items and deduplicate
      const cleaned = deduplicateMediaItems(parsed.filter((item) => !isSampleItem(item)));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      console.error("Failed to load local library items:", e);
      return [];
    }
  }

  // Save all items to localStorage and notify local subscribers
  static saveLocalItems(items: MediaItem[]): void {
    if (typeof window === "undefined") return;
    try {
      const deduped = deduplicateMediaItems(items);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
      this.notifySubscribers(deduped);
    } catch (e) {
      console.error("Failed to save local items:", e);
    }
  }

  // Notify any local UI listeners
  private static notifySubscribers(items: MediaItem[]): void {
    this.localSubscribers.forEach((cb) => {
      try {
        cb(items);
      } catch (err) {
        console.error("Subscriber error", err);
      }
    });
  }

  // Subscribe to library updates (seamlessly handles Firebase Firestore OR LocalStorage)
  static subscribe(onUpdate: (items: MediaItem[]) => void): () => void {
    this.localSubscribers.add(onUpdate);

    // Initial emission from local items
    const initialLocal = this.getLocalItems();
    onUpdate(initialLocal);

    // If Firebase is configured, set up Firestore realtime listener
    if (typeof window !== "undefined" && isFirebaseConfigured() && !this.isListeningToFirestore) {
      try {
        const { db, auth } = getFirebaseInstance();
        if (db) {
          const attachListener = (userId?: string) => {
            if (this.firestoreUnsubscribe) {
              this.firestoreUnsubscribe();
            }

            const itemsCol = userId
              ? collection(db, "users", userId, "library_items")
              : collection(db, "media_items");
            const q = query(itemsCol, orderBy("updatedAt", "desc"));

            this.firestoreUnsubscribe = onSnapshot(
              q,
              (snapshot) => {
                const firestoreItems: MediaItem[] = [];
                const sampleDocIdsToDelete: string[] = [];

                snapshot.forEach((docSnap) => {
                  const id = docSnap.id;
                  if (isSampleItem({ id })) {
                    sampleDocIdsToDelete.push(id);
                  } else {
                    firestoreItems.push({ id, ...(docSnap.data() as Omit<MediaItem, "id">) });
                  }
                });

                // Auto-delete residual sample/dummy items from Firestore
                if (sampleDocIdsToDelete.length > 0 && userId && db) {
                  sampleDocIdsToDelete.forEach((sampleId) => {
                    const docRef = doc(db, "users", userId, "library_items", sampleId);
                    deleteDoc(docRef).catch(() => { });
                  });
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreItems));
                this.notifySubscribers(firestoreItems);
              },
              (error) => {
                console.warn("Firestore listener error, falling back to local mode:", error);
              }
            );
          };

          if (auth) {
            onAuthStateChanged(auth, (user) => {
              if (user?.uid) {
                attachListener(user.uid);
              } else if (this.firestoreUnsubscribe) {
                this.firestoreUnsubscribe();
                this.firestoreUnsubscribe = null;
              }
            });
          }

          this.isListeningToFirestore = true;
        }
      } catch (err) {
        console.warn("Failed to attach Firestore listener:", err);
      }
    }

    return () => {
      this.localSubscribers.delete(onUpdate);
      if (this.localSubscribers.size === 0 && this.firestoreUnsubscribe) {
        this.firestoreUnsubscribe();
        this.firestoreUnsubscribe = null;
        this.isListeningToFirestore = false;
      }
    };
  }

  // Add or update an item
  static async saveItem(item: MediaItem): Promise<void> {
    const now = new Date().toISOString();
    const updatedItem: MediaItem = {
      ...item,
      updatedAt: now,
      createdAt: item.createdAt || now,
    };

    // Update in localStorage first (prevent duplicate items for the same media)
    const current = this.getLocalItems();
    const index = current.findIndex(
      (i) => i.id === item.id || (i.type === item.type && isSameMediaItem(i, item))
    );
    let nextList: MediaItem[];
    let targetItemToSync = updatedItem;

    if (index >= 0) {
      const existing = current[index];
      targetItemToSync = {
        ...existing,
        ...updatedItem,
        id: existing.id, // Preserve existing ID
        status: updatedItem.status || existing.status,
        updatedAt: now,
      };
      nextList = [...current];
      nextList[index] = targetItemToSync;
    } else {
      nextList = [updatedItem, ...current];
    }
    this.saveLocalItems(nextList);

    // Sync to Firestore if configured
    if (isFirebaseConfigured()) {
      try {
        const { db, auth } = getFirebaseInstance();
        if (db && auth) {
          if (!auth.currentUser && typeof auth.authStateReady === "function") {
            await auth.authStateReady();
          }
          const user = auth.currentUser;
          if (user) {
            const cleaned = JSON.parse(JSON.stringify(targetItemToSync));
            cleaned.userId = user.uid;
            const userDocRef = doc(db, "users", user.uid, "library_items", targetItemToSync.id);
            await setDoc(userDocRef, cleaned, { merge: true });
          }
          // ponytail: unauthenticated users persist in localStorage only, avoiding Firestore permission-denied
        }
      } catch (err) {
        console.error("Failed to sync item to Firestore:", err);
      }
    }
  }

  // Remove an item
  static async deleteItem(id: string): Promise<void> {
    // Remove from localStorage
    const current = this.getLocalItems();
    const filtered = current.filter((i) => i.id !== id);
    this.saveLocalItems(filtered);

    // Remove from Firestore if configured
    if (isFirebaseConfigured()) {
      try {
        const { db, auth } = getFirebaseInstance();
        if (db && auth) {
          if (!auth.currentUser && typeof auth.authStateReady === "function") {
            await auth.authStateReady();
          }
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, "users", user.uid, "library_items", id);
            await deleteDoc(userDocRef);
          }
        }
      } catch (err) {
        console.error("Failed to delete item from Firestore:", err);
      }
    }
  }

  // Push local items to cloud Firestore (only for authenticated users)
  static async syncLocalToCloud(targetUserId?: string): Promise<number> {
    if (!isFirebaseConfigured()) return 0;
    const { db, auth } = getFirebaseInstance();
    if (!db) return 0;

    let uid = targetUserId;
    if (!uid && auth) {
      if (!auth.currentUser && typeof auth.authStateReady === "function") {
        await auth.authStateReady();
      }
      uid = auth.currentUser?.uid;
    }
    // ponytail: never write to cloud if unauthenticated to prevent permission-denied errors
    if (!uid) return 0;

    const localItems = this.getLocalItems();
    let count = 0;
    for (const item of localItems) {
      if (isSampleItem(item)) continue;
      try {
        const docRef = doc(db, "users", uid, "library_items", item.id);
        const cleaned = JSON.parse(JSON.stringify({ ...item, userId: uid }));
        await setDoc(docRef, cleaned, { merge: true });
        count++;
      } catch (e) {
        console.error("Error syncing item to Firestore:", item.id, e);
      }
    }
    return count;
  }

  // Pull cloud Firestore items into local storage (purging any legacy sample data)
  static async syncCloudToLocal(): Promise<MediaItem[]> {
    if (!isFirebaseConfigured()) return this.getLocalItems();
    const { db, auth } = getFirebaseInstance();
    if (!db) return this.getLocalItems();

    const userId = auth?.currentUser?.uid;
    const itemsCol = userId
      ? collection(db, "users", userId, "library_items")
      : collection(db, "media_items");
    const snapshot = await getDocs(itemsCol);
    const cloudItems: MediaItem[] = [];
    const sampleDocIdsToDelete: string[] = [];

    snapshot.forEach((docSnap) => {
      const id = docSnap.id;
      if (isSampleItem({ id })) {
        sampleDocIdsToDelete.push(id);
      } else {
        cloudItems.push({ id, ...(docSnap.data() as Omit<MediaItem, "id">) });
      }
    });

    if (sampleDocIdsToDelete.length > 0 && userId) {
      sampleDocIdsToDelete.forEach((sampleId) => {
        const docRef = doc(db, "users", userId, "library_items", sampleId);
        deleteDoc(docRef).catch(() => { });
      });
    }

    this.saveLocalItems(cloudItems);
    return cloudItems;
  }

  // Reset to empty library
  static resetToSamples(): void {
    this.saveLocalItems([]);
  }

  // Export JSON file
  static exportBackup(): string {
    const items = this.getLocalItems();
    return JSON.stringify(items, null, 2);
  }

  // Import JSON file
  static importBackup(jsonString: string): boolean {
    try {
      const items = JSON.parse(jsonString) as MediaItem[];
      if (Array.isArray(items) && items.length > 0 && items[0].title) {
        this.saveLocalItems(items);
        if (isFirebaseConfigured()) {
          this.syncLocalToCloud();
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

