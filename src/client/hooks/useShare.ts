import { useContext } from 'react';

import { ShareContext, ShareContextValue } from '@context/contexts';

export function useShare(): ShareContextValue {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error('useShare must be used within ShareProvider');
  return ctx;
}
