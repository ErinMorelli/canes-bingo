import { useState } from 'react';

import { DrawerContext } from '@context/contexts';

export function DrawerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <DrawerContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </DrawerContext.Provider>
  );
}
