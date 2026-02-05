export * from './board.ts';
export * from './boardArgs.ts';
export * from './config.ts';
export * from './games.ts';
export * from './groups.ts';
export * from './squares.ts';

import { combineReducers } from '@reduxjs/toolkit';

import boardArgsReducer from './boardArgs.ts';
import boardReducer from './board.ts';
import configReducer from './config.ts';
import gamesReducer from './games.ts';
import groupsReducer from './groups.ts';
import squaresReducer from './squares.ts';

const rootReducer = combineReducers({
  board: boardReducer,
  boardArgs: boardArgsReducer,
  config: configReducer,
  games: gamesReducer,
  groups: groupsReducer,
  squares: squaresReducer,
});

export default rootReducer;
