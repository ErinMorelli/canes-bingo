import { ConfigKey, Group as G } from './constants.ts';
import { ThemeConfig } from 'antd';

export type SingleGroup = typeof G.SingleGroups[number];
export type MultiGroup = typeof G.MultiGroups[number];

export type Group = SingleGroup | MultiGroup;
export type GroupValue<T> = T extends SingleGroup ? Category : Array<Category>;

export type BaseBoardArgs<T extends Group> = Record<T, GroupValue<T>>;
export type BoardArgs = BaseBoardArgs<SingleGroup> & BaseBoardArgs<MultiGroup>;

export type BaseUpdateBoardArg<G extends Group> = {
  groupName: G,
  value: BoardArgs[G];
};
export type UpdateBoardArg =
  | BaseUpdateBoardArg<SingleGroup>
  | BaseUpdateBoardArg<MultiGroup>;

export type Square = {
  id: number;
  value: string;
  description?: string;
  active: boolean;
};
export type Squares = Array<Square>;

export type SquaresState = {
  squares: Squares;
  squaresLoaded: boolean;
}

export type BoardSquare = {
  selected: boolean;
  value: Square;
};
export type Board = Array<Array<BoardSquare>>;

export type UpdateSquareArgs = {
  col: number;
  row: number;
  value: BoardSquare;
};

export type Category = {
  id: number;
  name: string;
  label: string;
  description?: string;
  isDefault: boolean;
};

export type GroupResult = Omit<Category, 'name' | 'isDefault'> & {
  description?: string;
  categories: Array<Category>;
};

export type FetchGroupResult = {
  group: GroupResult;
  groupName: string;
};

export type GroupsStateGroups = {
  [value in Group]?: GroupResult;
};

export type GroupsState = {
  groups: GroupsStateGroups;
  defaultArgs: BoardArgs;
  loaded: boolean;
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

export type ConfigState = Record<ConfigKey, string>;

export type ConfigResult = {
  id?: number;
  key: ConfigKey
  value: string;
};

export type Theme = {
  config: ThemeConfig;
  label: string;
  customClass?: string;
};
