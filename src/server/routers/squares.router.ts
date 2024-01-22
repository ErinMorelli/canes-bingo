import { Request, RequestHandler, Router } from 'express';

import {
  addSquare,
  getSquare,
  getSquares,
  removeSquare,
  updateSquare
} from '../controllers';
import { GetSquaresQuery } from '../types.ts';
import { isAuthenticated } from './auth.router.ts';

const router = Router();

const list: RequestHandler = async (
  req: Request<{}, {}, {}, GetSquaresQuery>,
  res
) => {
  const { exclude, include } = req.query;
  try {
    const excludes = exclude
      ? exclude.split(',').map((x) => x.trim())
      : undefined;
    const includes  = include
      ? include.split(',').map((x) => x.trim())
      : undefined;
    const result = await getSquares(includes, excludes);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    const result = await getSquare(parseInt(req.params.squareId));
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    const { squareId } = req.params;
    const { categories, ...updatedSquare} = req.body;
    const result = await updateSquare(
      parseInt(squareId),
      updatedSquare,
      categories || [],
    );
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    const { categories, ...newSquare} = req.body;
    const result = await addSquare(
      newSquare,
      categories || []
    );
    res.status(201).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    const result = await removeSquare(parseInt(req.params.squareId));
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
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
