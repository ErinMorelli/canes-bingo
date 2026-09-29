import { useMemo, useState } from 'react';

import { SubmitContext } from '@context/contexts';

/**
 * Opens the "Submit a Square" modal.
 *
 * Lives above the router because the affordance appears in two separate
 * trees — the site footer and the squares database header — and both need to
 * drive the one modal.
 */
export function SubmitProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return (
    <SubmitContext.Provider value={value}>
      {children}
    </SubmitContext.Provider>
  );
}
