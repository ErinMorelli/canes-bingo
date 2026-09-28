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

// Values written but not yet serialized. Persisting is write-behind: marking a
// square used to run JSON.stringify + setItem + getItem + JSON.parse over the
// whole board inside the click handler, which pushed the daub about a frame
// past the click. Reads resolve from here first, so a render sees the new value
// immediately and the serialization happens after paint.
const pending = new Map<string, unknown>();

let flushScheduled = false;

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

/**
 * Serialize every pending write to localStorage.
 *
 * Also called on pagehide/visibilitychange so a write is never lost to a tab
 * closing in the window between the click and the flush.
 */
export function flushStorageWrites(): void {
  flushScheduled = false;
  if (pending.size === 0) return;

  pending.forEach((value, key) => {
    try {
      const raw = JSON.stringify(value);
      globalThis.localStorage.setItem(key, raw);
      // Seed the read cache with the very object that was just serialized: the
      // snapshot identity has to survive the flush, or useSyncExternalStore
      // sees the value change again the moment the write lands.
      cache.set(key, { raw, value });
    } catch (e) {
      console.error('Failed to write to localStorage:', key, e);
      /*
        The write failed — quota, private mode — but the value is still what
        the session should read. `pending` is cleared below either way, so
        without seeding the cache the next read falls back to whatever is
        still in storage and the change visibly reverts: a daub would come
        back off the board.

        Seeded against the raw string *currently stored*, so the cache stays
        valid by its own rule (cached.raw === the raw in storage) and keeps
        returning the newer in-memory value.
      */
      let storedRaw: string | null = null;
      try {
        storedRaw = globalThis.localStorage.getItem(key);
      } catch {
        // Storage is unreachable entirely; a null raw still keys the cache.
      }
      cache.set(key, { raw: storedRaw, value });
    }
  });

  pending.clear();
}

function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  // A macrotask, not a microtask: microtasks drain before the browser paints,
  // so queueMicrotask would leave the serialization on the critical path.
  setTimeout(flushStorageWrites, 0);
}

if (typeof window !== 'undefined') {
  // `visibilitychange` is the reliable one; `pagehide` covers the rest.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushStorageWrites();
  });
  window.addEventListener('pagehide', flushStorageWrites);
}

function readValue<T>(key: string, initialValue: T): T {
  // An unflushed local write is newer than whatever is still in storage.
  if (pending.has(key)) return pending.get(key) as T;

  let raw: string | null = null;
  try {
    raw = globalThis.localStorage.getItem(key);
  } catch (e) {
    console.error('Failed to read from localStorage:', key, e);
    return initialValue;
  }

  const cached = cache.get(key);
  if (cached?.raw === raw) return cached.value as T;

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
      pending.set(key, next);
      // Render from memory now; persist after the browser has painted.
      emit(key);
      scheduleFlush();
    },
    [key]
  );

  return [storedValue, setValue];
}
