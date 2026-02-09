import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addGame,
  getGame,
  getGames,
  removeGame,
  updateGame
} from '../controllers';
import { handleError, resourceIdSchema } from '../utils.ts';

const newGameSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  isDefault: Joi.boolean(),
  patterns: Joi.array().items(Joi.number()),
});

const updateGameSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  isDefault: Joi.boolean(),
  patterns: Joi.object({
    added: Joi.array().items(Joi.number()),
    removed: Joi.array().items(Joi.number()),
  }),
});

const router = Router();

const list: RequestHandler = async (_, res) => {
  try {
    const result = await getGames();
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ gameId: resourceIdSchema }));
    const { gameId } = req.params;
    const result = await getGame(Number.parseInt(gameId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ gameId: resourceIdSchema }));
    Joi.assert(req.body, updateGameSchema);

    const { gameId } = req.params;
    const { patterns, ...updatedGame } = req.body;

    const result = await updateGame(
      Number.parseInt(gameId),
      updatedGame,
      {
        added: patterns?.added || [],
        removed: patterns?.removed || [],
      },
    );
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, newGameSchema);
    const { name, description, isDefault, patterns } = req.body;

    const result = await addGame(
      { name, description, isDefault },
      patterns || []
    );
    return res.status(201).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ gameId: resourceIdSchema }));
    const { gameId } = req.params;
    const result = await removeGame(Number.parseInt(gameId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

router.route('/games')
  .get(list)
  .post(isAuthenticated, post);

router.route('/games/:gameId')
  .get(get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
