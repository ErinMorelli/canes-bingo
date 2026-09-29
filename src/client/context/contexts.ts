import { createContext } from 'react';

import {
  Board,
  BoardArgs,
  NHLActiveGame, NHLGameState,
  Pattern,
  SingleGroup,
  Theme,
  UpdateBoardArg
} from '@app/types';

export type ConfigContextValue = {
  theme: Theme & { name: string };
  setTheme: (value: string) => void;
  showTooltips: boolean;
  setTooltips: (value: boolean) => void;
  headerText: string | undefined;
  /** Label for the centre square, already defaulted — never empty. */
  freeSpace: string;
  customClass: string | undefined;
  festiveLights: boolean;
  isLoading: boolean;
};

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export type GameBoardContextValue = {
  board: Board;
  boardArgs: BoardArgs;
  /**
   * Options currently showing a value derived from tonight's game rather
   * than one the player picked. Drives the "Auto" hint, and empties as soon
   * as they choose for themselves.
   */
  autoGroups: ReadonlySet<SingleGroup>;
  boardReady: boolean;
  /** Options have changed since the card on screen was dealt. */
  cardDirty: boolean;
  squaresLoading: boolean;
  squaresError: boolean;
  squaresRemaining: number;
  /** The pattern the board has completed, or null while none is. */
  winningPattern: Pattern | null;
  /** A win is on the board and the player has not dismissed the celebration. */
  hasWon: boolean;
  /**
   * `row-col` keys of the squares that form the win, for the winning ring.
   * Includes the free space when the pattern runs through the centre.
   */
  winningSquares: ReadonlySet<string>;
  /** Whether "keep playing" has anywhere to go — i.e. Blackout is not current. */
  canKeepPlaying: boolean;
  /** Squares marked since the page loaded, so a restored win can skip the confetti. */
  daubCount: number;
  loadBoard: (force?: boolean) => void;
  generateBoard: () => void;
  selectSquare: (row: number, col: number) => void;
  updateBoardArg: (args: UpdateBoardArg) => void;
  validateGameBoard: () => boolean;
  /** Stand down the celebration, leaving the board and the game alone. */
  dismissWin: () => void;
  /** Move to Blackout with every daub intact, clearing the win. */
  keepPlaying: () => void;
};

export const GameBoardContext = createContext<GameBoardContextValue | null>(null);

export type DrawerContextValue = {
  isOpen: boolean;
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

export type ShareContextValue = {
  /** Render the card to an image, upload it, and show the link. */
  share: () => void;
  /** A capture or upload is in flight. */
  isSharing: boolean;
};

export const ShareContext = createContext<ShareContextValue | null>(null);

export type ActiveGameContextValue = {
  activeGame: NHLActiveGame;
  refreshGame: () => void;
  gameState: NHLGameState;
  isPeriodActive: boolean;
};

export const ActiveGameContext = createContext<ActiveGameContextValue | null>(null);
