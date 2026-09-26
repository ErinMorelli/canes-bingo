import { z } from 'zod';
import { ThemeConfig } from 'antd';

import { categoryOutputSchema } from '@schema/category.schema';
import { gameOutputSchema } from '@schema/game.schema';
import {
  groupCategoryItemSchema,
  groupOutputSchema
} from '@schema/group.schema';
import { patternSquareSchema, patternOutputSchema } from '@schema/pattern.schema';
import { squareOutputSchema } from '@schema/square.schema';

import { Group as G } from './constants';

// --- Derived from API output schemas ---

export type PatternSquare = z.infer<typeof patternSquareSchema>;
export type Pattern = z.infer<typeof patternOutputSchema>;
export type Patterns = Array<Pattern>;

export type Category = Omit<z.infer<typeof categoryOutputSchema>, 'groupId'>;

export type Square = Omit<z.infer<typeof squareOutputSchema>, 'categories'>;
export type Squares = Array<Square>;

export type Game = z.infer<typeof gameOutputSchema>;
export type Games = Array<Game>;

export type GroupOption = z.infer<typeof groupCategoryItemSchema>;
export type GroupResult = Required<z.infer<typeof groupOutputSchema>>;

// --- Client-only types ---

export type SingleGroup = typeof G.SingleGroups[number];
export type MultiGroup = typeof G.MultiGroups[number];
export type Group = SingleGroup | MultiGroup;
export type GroupValue<T> = T extends SingleGroup ? Category : Array<Category>;

export type BaseBoardArgs<T extends Group> = Record<T, GroupValue<T>>;
export type BoardArgs = BaseBoardArgs<SingleGroup> & BaseBoardArgs<MultiGroup>;

export type BaseUpdateBoardArg<G extends Group> = {
  groupName: G;
  value: BoardArgs[G];
};
export type UpdateBoardArg =
  | BaseUpdateBoardArg<SingleGroup>
  | BaseUpdateBoardArg<MultiGroup>;

export type BoardSquare = {
  selected: boolean;
  value: Square;
};
export type Board = Array<Array<BoardSquare>>;

export type GroupsStateGroups = {
  [value in Group]?: GroupResult;
};

export type ImgurUploadResult = {
  status: number;
  success: boolean;
  data: {
    id: string;
    deletehash: string;
    type: string;
    width: number;
    height: number;
    size: number;
    link: string;
    datetime: number;
  };
};

export type Theme = {
  config: ThemeConfig;
  label: string;
  customClass?: string;
};

export type NHLScheduleTeam = {
  id: number;
  abbrev: string;
  commonName: { default: string };
  placeName: { default: string };
  logo: string;
  darkLogo: string;
  score?: number;
  sog?: number;
};

export type NHLScheduleGame = {
  id: number;
  gameType: number;
  gameDate: string;
  startTimeUTC: string;
  venueUTCOffset: string;
  venueTimezone: string;
  gameState: string;
  gameScheduleState: string;
  awayTeam: NHLScheduleTeam;
  homeTeam: NHLScheduleTeam;
};

export type NHLScheduleResult = {
  games: Array<NHLScheduleGame>;
};

export type NHLActiveGame = NHLScheduleGame & {
  shootoutInUse: boolean;
  otInUse: boolean;
  tiesInUse: boolean;
  regPeriods: number;
  maxPeriods: number;
  // Both are absent until the game starts — confirmed against /landing for a
  // FUT game, which carries neither.
  clock?: {
    timeRemaining: string;
    secondsRemaining: number;
    running: boolean;
    inIntermission: boolean;
  };
  periodDescriptor?: {
    number: number;
    periodType: string;
    maxRegulationPeriods: number;
  };
};

export enum NHLGameState {
  LIVE = 'live',
  PREGAME = 'pre',
  POSTGAME = 'post',
  FUTURE = 'future',
  NONE = 'none',
}
