import { createContext } from 'react';

import { Board, BoardArgs, Theme, UpdateBoardArg } from '@app/types';

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
  squaresLoading: boolean;
  squaresError: boolean;
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
