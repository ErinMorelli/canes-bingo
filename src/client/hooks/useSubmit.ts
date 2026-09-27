import { useContext } from 'react';

import { SubmitContext, SubmitContextValue } from '@context/contexts';

export function useSubmit(): SubmitContextValue {
  const ctx = useContext(SubmitContext);
  if (!ctx) throw new Error('useSubmit must be used within SubmitProvider');
  return ctx;
}
