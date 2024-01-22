export * from './board.ts';
export * from './boardArgs.ts';
export * from './groups.ts';
export * from './squares.ts';

import { combineReducers } from '@reduxjs/toolkit';

import boardReducer from './board.ts';
import boardArgsReducer from './boardArgs.ts';
import groupsReducer from './groups.ts';
import squaresReducer from './squares.ts';

const rootReducer = combineReducers({
  board: boardReducer,
  boardArgs: boardArgsReducer,
  groups: groupsReducer,
  squares: squaresReducer,
});

export default rootReducer;
