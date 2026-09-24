import { useContext } from 'react';

import { GameBoardContext, GameBoardContextValue } from '@context/contexts';

export function useGameBoard(): GameBoardContextValue {
  const ctx = useContext(GameBoardContext);
  if (!ctx) throw new Error('useGameBoard must be used within GameBoardProvider');
  return ctx;
}
