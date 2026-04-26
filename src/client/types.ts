import { z } from 'zod';
import { ThemeConfig } from 'antd';

import { categoryOutputSchema } from '@schema/category.schema';
import { gameOutputSchema } from '@schema/game.schema';
import { groupOutputSchema } from '@schema/group.schema';
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

