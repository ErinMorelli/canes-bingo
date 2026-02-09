import { Request, RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addSquare,
  getSquare,
  getSquares,
  removeSquare,
  updateSquare
} from '../controllers';
import { GetSquaresQuery } from '../types.ts';
import { handleError, resourceIdSchema } from '../utils.ts';

const newSquareSchema = Joi.object({
  content: Joi.string().required(),
  description: Joi.string(),
  active: Joi.boolean(),
  categories: Joi.array().items(Joi.number()),
});

const updateSquareSchema = Joi.object({
  content: Joi.string().required(),
  description: Joi.string(),
  active: Joi.boolean(),
  categories: Joi.object({
    added: Joi.array().items(Joi.number()),
    removed: Joi.array().items(Joi.number()),
  }),
});

const squareListQuerySchema = Joi.object({
  exclude: Joi.string(),
  include: Joi.string(),
  category_id: Joi.string().pattern(/^\d+$/),
});

const router = Router();

const list: RequestHandler = async (
  req: Request<{}, {}, {}, GetSquaresQuery>,
  res
) => {
  try {
    Joi.assert(req.query, squareListQuerySchema);
    const { exclude, include, category_id: categoryId } = req.query;
    const excludes = exclude
      ? exclude.split(',').map((x) => x.trim())
      : undefined;
    const includes  = include
      ? include.split(',').map((x) => x.trim())
      : undefined;
    const result = await getSquares(
      includes,
      excludes,
      categoryId ? Number.parseInt(categoryId) : undefined
    );
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ squareId: resourceIdSchema }));
    const { squareId } = req.params;
    const result = await getSquare(Number.parseInt(squareId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ squareId: resourceIdSchema }));
    Joi.assert(req.body, updateSquareSchema);

    const { squareId } = req.params;
    const { categories, ...updatedSquare} = req.body;

    const result = await updateSquare(
      Number.parseInt(squareId),
      updatedSquare,
      {
        added: categories?.added || [],
        removed: categories?.removed || [],
      },
    );
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, newSquareSchema);
    const { categories, ...newSquare} = req.body;
    const result = await addSquare(
      newSquare,
      categories || []
    );
    return res.status(201).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ squareId: resourceIdSchema }));
    const { squareId } = req.params;
    const result = await removeSquare(Number.parseInt(squareId));
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

router.route('/squares')
  .get(list)
  .post(isAuthenticated, post);

router.route('/squares/:squareId')
  .get(get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
