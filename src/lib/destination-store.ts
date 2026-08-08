import { useCallback, useSyncExternalStore } from "react";
import type { Destination } from "./destinations";

const KEY = "vacsim.generatedDestinations";

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
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

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

const EMPTY: Destination[] = [];

export function useGeneratedDestinations() {
  return useSyncExternalStore(subscribe, () => read<Destination[]>(KEY, EMPTY), () => EMPTY);
}

export function getGeneratedDestinations() {
  return read<Destination[]>(KEY, EMPTY);
}

export function saveGeneratedDestination(destination: Destination) {
  const existing = read<Destination[]>(KEY, []);
  const updated = [destination, ...existing.filter((d) => d.slug !== destination.slug)];
  write(KEY, updated);
}
