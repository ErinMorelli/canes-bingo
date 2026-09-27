import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query from React.
 *
 * Almost everything responsive in this app belongs in style.scss; this is for
 * the cases where the breakpoint decides a *prop* rather than a style — the
 * options drawer picking `placement="bottom"` over `placement="right"`, for
 * one, which no stylesheet can express.
 *
 * Built on useSyncExternalStore rather than useState + useEffect so the first
 * render already has the right answer: an effect-based version renders once
 * with a guessed value, which would flash the desktop panel on a phone.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (listener: () => void) => {
      const list = globalThis.matchMedia?.(query);
      if (!list) return () => undefined;
      list.addEventListener('change', listener);
      return () => list.removeEventListener('change', listener);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => globalThis.matchMedia?.(query).matches ?? false,
    [query]
  );

  // No matchMedia outside a browser (tests, any future prerender): report no
  // match, which lands on the desktop layout.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
