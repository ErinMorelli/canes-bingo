import { useCallback, useRef, useSyncExternalStore } from 'react';

type Listener = () => void;

// All hook instances sharing a key share one subscriber list, so a write in one
// component re-renders every other reader. With a plain useState per instance
// they each keep a private copy and silently drift apart.
const listeners = new Map<string, Set<Listener>>();

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value between changes, so the parsed result is cached against the raw string
// it was parsed from. Keying on the raw string also means an external
// localStorage.clear() invalidates the cache on its own.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(key: string, listener: Listener): () => void {
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(listener);

  return () => {
    keyListeners.delete(listener);
    if (keyListeners.size === 0) listeners.delete(key);
  };
}

function emit(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

function readValue<T>(key: string, initialValue: T): T {
  let raw: string | null = null;
  try {
    raw = globalThis.localStorage.getItem(key);
  } catch (e) {
    console.error('Failed to read from localStorage:', key, e);
    return initialValue;
  }

  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  let value = initialValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch (e) {
      console.error('Failed to read from localStorage:', key, e);
    }
  }

  cache.set(key, { raw, value });
  return value;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Held in a ref so a caller passing an inline literal (e.g. `[]` or `{}`)
  // does not change the snapshot identity on every render.
  const initialRef = useRef(initialValue);

  const subscribeToKey = useCallback(
    (listener: Listener) => subscribe(key, listener),
    [key]
  );
  const getSnapshot = useCallback(() => readValue<T>(key, initialRef.current), [key]);

  const storedValue = useSyncExternalStore(subscribeToKey, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const prev = readValue<T>(key, initialRef.current);
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      try {
        globalThis.localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to write to localStorage:', key, e);
      }
      emit(key);
    },
    [key]
  );

  return [storedValue, setValue];
}
