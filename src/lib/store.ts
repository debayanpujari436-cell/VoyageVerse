import { useCallback, useEffect, useSyncExternalStore } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import type { Simulation } from "./sim-types";
import { useAuth, getFirestoreUserSimulationsCollection, getFirestoreCurrentUserId } from "./firebase";

const KEY = "vacsim.simulations";
const FAV = "vacsim.favorites";

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const cache = new Map<string, unknown>();
function cachedRead<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  const value = read<T>(key, fallback);
  cache.set(key, value);
  return value;
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  cache.clear();
  emit();
}

const EMPTY: Simulation[] = [];

function firestoreSimulationDocRef(userId: string, id: string) {
  return doc(getFirestoreUserSimulationsCollection(userId), id);
}

async function saveSimulationToFirestore(sim: Simulation, userId: string) {
  await setDoc(firestoreSimulationDocRef(userId, sim.id), sim);
}

async function deleteSimulationFromFirestore(id: string, userId: string) {
  await deleteDoc(firestoreSimulationDocRef(userId, id));
}

function mergeSimulations(local: Simulation[], remote: Simulation[]) {
  const remoteById = new Map(remote.map((sim) => [sim.id, sim]));
  const merged = [...remote];
  for (const sim of local) {
    if (!remoteById.has(sim.id)) {
      merged.push(sim);
    }
  }
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
}

export function useSimulations() {
  const user = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const coll = getFirestoreUserSimulationsCollection(user.uid);
    const queryRef = query(coll, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      queryRef,
      async (snapshot) => {
        const remote = snapshot.docs.map((doc) => doc.data() as Simulation);
        const local = read<Simulation[]>(KEY, []);
        const merged = mergeSimulations(local, remote);
        write(KEY, merged);

        const remoteIds = new Set(remote.map((sim) => sim.id));
        for (const sim of local) {
          if (!remoteIds.has(sim.id)) {
            await saveSimulationToFirestore(sim, user.uid);
          }
        }
      },
      (error) => {
        console.error("Firestore simulation sync error", error);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  return useSyncExternalStore(
    subscribe,
    () => cachedRead<Simulation[]>(KEY, EMPTY),
    () => EMPTY,
  );
}

export function saveSimulation(sim: Simulation) {
  const all = read<Simulation[]>(KEY, []);
  write(KEY, [sim, ...all.filter((s) => s.id !== sim.id)].slice(0, 20));

  const uid = getFirestoreCurrentUserId();
  if (!uid) {
    // User is not authenticated, keep simulation only in localStorage.
    return;
  }

  void saveSimulationToFirestore(sim, uid).catch((error) => {
    console.error("Failed to save simulation to Firestore", error);
  });
}

export function deleteSimulation(id: string) {
  const next = read<Simulation[]>(KEY, []).filter((s) => s.id !== id);
  write(KEY, next);

  const uid = getFirestoreCurrentUserId();
  if (!uid) {
    // User is not authenticated, delete only from localStorage.
    return;
  }

  void deleteSimulationFromFirestore(id, uid).catch((error) => {
    console.error("Failed to delete simulation from Firestore", error);
  });
}

export function getSimulation(id: string) {
  return read<Simulation[]>(KEY, []).find((s) => s.id === id) ?? null;
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    () => cachedRead<string[]>(FAV, []),
    () => [] as string[],
  );
  const toggle = useCallback((slug: string) => {
    const list = read<string[]>(FAV, []);
    write(FAV, list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
  }, []);
  return { favorites, toggle };
}