import { useCallback, useMemo, useState } from 'react';

import { DrawerContext } from '@context/contexts';

export function DrawerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);

  // Stable identities, so the memo below only changes when `isOpen` does.
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  /*
    Memoised for the same reason SubmitContext and ShareContext are: an inline
    object literal is a new value every render, so every consumer of this
    context re-rendered whenever the provider did, whether the drawer had
    moved or not. This provider wraps the whole app layout, so that was the
    board and everything under it.
  */
  const value = useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close]
  );

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
}
