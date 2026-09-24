import { useContext } from 'react';

import { ConfigContext, ConfigContextValue } from '@context/contexts';

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
