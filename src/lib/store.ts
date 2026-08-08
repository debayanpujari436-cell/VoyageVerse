import { useCallback, useSyncExternalStore } from "react";
import type { Simulation } from "./sim-types";

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

export function useSimulations() {
  return useSyncExternalStore(
    subscribe,
    () => cachedRead<Simulation[]>(KEY, EMPTY),
    () => EMPTY,
  );
}

export function saveSimulation(sim: Simulation) {
  const all = read<Simulation[]>(KEY, []);
  write(KEY, [sim, ...all.filter((s) => s.id !== sim.id)].slice(0, 20));
}

export function deleteSimulation(id: string) {
  write(
    KEY,
    read<Simulation[]>(KEY, []).filter((s) => s.id !== id),
  );
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