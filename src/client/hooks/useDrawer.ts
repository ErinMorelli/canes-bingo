import { useContext} from 'react';

import { DrawerContext, DrawerContextValue } from '@context/contexts';

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
}
