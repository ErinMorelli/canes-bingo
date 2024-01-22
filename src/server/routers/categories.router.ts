import { RequestHandler, Router } from 'express';

import {
  addCategory,
  getCategories,
  getCategory,
  removeCategory,
  updateCategory
} from '../controllers';
import { isAuthenticated } from './auth.router.ts';

const router = Router();

const list: RequestHandler = async (req, res) => {
  try {
    const { groupId } = req.query;
    const parsedId = typeof groupId === 'string' ? parseInt(groupId) : undefined;
    const result = await getCategories(parsedId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message
    });
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    const result = await getCategory(parseInt(req.params.categoryId));
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    const result = await updateCategory(parseInt(req.params.categoryId), req.body);
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    const result = await addCategory(req.body);
    res.status(201).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    const result = await removeCategory(parseInt(req.params.categoryId));
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

router.route('/categories')
  .get(list)
  .post(isAuthenticated, post);

router.route('/categories/:categoryId')
  .get(get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
