import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addPattern,
  getPattern,
  getPatterns,
  removePattern,
  updatePattern
} from '../controllers';
import { handleError } from '../utils.ts';

const patternSchema = Joi.object({
  name: Joi.string().required(),
  squares: Joi.string().required(),
});

const squareSchema = Joi.array().items(
  Joi.object({
    col: Joi.number().integer().min(0).max(4).required(),
    row: Joi.number().integer().min(0).max(4).required(),
  }),
);

const router = Router();

const list: RequestHandler = async (_, res) => {
  try {
    const result = await getPatterns();
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ patternId: Joi.number().required() }));
    const { patternId } = req.params;
    const result = await getPattern(Number.parseInt(patternId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ patternId: Joi.number().required() }));
    Joi.assert(req.body, patternSchema);

    const { patternId } = req.params;
    const { name, squares } = req.body;

    const parsedSquares = JSON.parse(squares);
    Joi.assert(parsedSquares, squareSchema);

    const result = await updatePattern(Number.parseInt(patternId), {
      name,
      squares,
    });
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, patternSchema);
    const { name, squares } = req.body;

    const parsedSquares = JSON.parse(squares);
    Joi.assert(parsedSquares, squareSchema);

    const result = await addPattern({
      name,
      squares,
    });
    return res.status(201).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ patternId: Joi.number().required() }));
    const { patternId } = req.params;
    const result = await removePattern(Number.parseInt(patternId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

router.route('/patterns')
  .get(list)
  .post(isAuthenticated, post);

router.route('/patterns/:patternId')
  .get(get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
