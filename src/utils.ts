import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string';

import {
  Board,
  BoardArgs,
  BoardIdResult,
  BoardSquare,
  Broadcast,
  Game,
  Square,
  Squares
} from './types.ts';

import squareData from './assets/squareData.json';

export function shuffleArray(array: Squares): Squares {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function chunkArray<T = Square>(list: Array<T>, chunkSize = 5): Array<Array<T>> {
  return [...Array(Math.ceil(list.length / chunkSize))].map(
    (_,i) => list.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
}

export function generateSquares(args: BoardArgs, size: number): Squares {
  const arr = shuffleArray([
    ...squareData.general,
    ...squareData[args.game],
    ...squareData[args.broadcast],
  ]);
  return arr.slice(0, size);
}

export function createBoard(args: BoardArgs, size = 25): Board {
  const squares = generateSquares(args, size);
  const chunks = chunkArray(squares);
  return chunks.map((row): BoardSquare[] =>
    row.map((col): BoardSquare => ({
      selected: false,
      value: col,
    }))
  );
}

export function getBoardId(board: Board, args: BoardArgs): string {
  const boardArr: Array<string> = [];
  board.forEach((row) => {
    row.forEach((col) => {
      const { selected, value } = col;
      boardArr.push(`${value.id}:${selected ? '1' : '0'}`);
    });
  });
  const arr = [
    args.game as string,
    args.broadcast as string,
    ...boardArr,
  ];
  return compressToEncodedURIComponent(arr.toString());
}

export function getSquareById(id: number): Square {
  const allSquares = Object.values(squareData).flat();
  return allSquares.find((s) => s.id === id)!;
}

export function parseBoardId(boardId: string): BoardIdResult | null {
  const arrStr = decompressFromEncodedURIComponent(boardId);
  if (!arrStr) return null;

  const arr = arrStr.split(',');
  if (arr.length !== 27) return null;  // 25 + 2 game args

  const game = arr[0] === Game.HOME ? Game.HOME : Game.AWAY;
  const broadcast = arr[1] === Broadcast.LOCAL ? Broadcast.LOCAL : Broadcast.NATIONAL;

  const board = chunkArray(arr.slice(2)).map((row) =>
    row.map((rawSquare) => {
      const [id, sel] = rawSquare.split(':');
      const squareId = parseInt(id);
      return {
        selected: sel === '1',
        value: {
          id: squareId,
          value: getSquareById(squareId).value,
        },
      };
    })
  );

  return {
    board,
    boardArgs: {
      game,
      broadcast
    },
  };
}

