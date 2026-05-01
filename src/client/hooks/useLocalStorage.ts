import { useCallback, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = globalThis.localStorage.getItem(key);
      return item === null ? initialValue : (JSON.parse(item) as T);
    } catch (e) {
      console.error('Failed to read from localStorage:', key, e);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          globalThis.localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to write to localStorage:', key, e);
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
