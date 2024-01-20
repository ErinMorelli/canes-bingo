import { createAction } from '@reduxjs/toolkit';
import { BoardArgs } from '../types.ts';

export * from './board.ts';
export * from './boardArgs.ts';

export const updateBoardArgs = createAction<BoardArgs>('updateBoardArgs');
