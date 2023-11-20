export enum Game {
  HOME = 'home',
  AWAY = 'away',
}

export enum Broadcast {
  LOCAL = 'local',
  NATIONAL = 'national',
}

export type Square = {
  id: number;
  value: string;
};

export type Squares = Array<Square>;

export type SquareDataKey = 'general'| Game | Broadcast;

export type SquareData = Record<SquareDataKey, Squares>;

export type BoardSquare = {
  selected: boolean;
  value: Square;
};

export type Board = Array<Array<BoardSquare>>;

export type BoardArgs = {
  game: Game;
  broadcast: Broadcast;
};

export type BoardIdResult = {
  board: Board;
  boardArgs: BoardArgs;
};

export type UpdateBoardArgs = {
  col: number;
  row: number;
  value: BoardSquare;
}
