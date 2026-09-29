import { useContext} from 'react';

import { ActiveGameContext, ActiveGameContextValue } from '@context/contexts';

export function useActiveGame(): ActiveGameContextValue {
  const ctx = useContext(ActiveGameContext);
  if (!ctx) throw new Error('useActiveGame must be used within ActiveGameProvider');
  return ctx;
}
