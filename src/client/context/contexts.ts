import { createContext } from 'react';

import {
  Board,
  BoardArgs,
  NHLActiveGame, NHLGameState,
  Theme,
  UpdateBoardArg
} from '@app/types';

export type ConfigContextValue = {
  theme: Theme & { name: string };
  setTheme: (value: string) => void;
  showTooltips: boolean;
  setTooltips: (value: boolean) => void;
  headerText: string | undefined;
  customClass: string | undefined;
  festiveLights: boolean;
  isLoading: boolean;
};

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export type GameBoardContextValue = {
  board: Board;
  boardArgs: BoardArgs;
  boardReady: boolean;
  /** Options have changed since the card on screen was dealt. */
  cardDirty: boolean;
  squaresLoading: boolean;
  squaresError: boolean;
  squaresRemaining: number;
  loadBoard: (force?: boolean) => void;
  generateBoard: () => void;
  selectSquare: (row: number, col: number) => void;
  updateBoardArg: (args: UpdateBoardArg) => void;
  validateGameBoard: () => boolean;
};

export const GameBoardContext = createContext<GameBoardContextValue | null>(null);

export type DrawerContextValue = {
  isOpen: boolean;
  toggle: (val: boolean) => void;
  open: () => void;
  close: () => void;
};

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export type SubmitContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const SubmitContext = createContext<SubmitContextValue | null>(null);

export type ActiveGameContextValue = {
  activeGame: NHLActiveGame;
  refreshGame: () => void;
  gameState: NHLGameState;
  isPeriodActive: boolean;
};

export const ActiveGameContext = createContext<ActiveGameContextValue | null>(null);
