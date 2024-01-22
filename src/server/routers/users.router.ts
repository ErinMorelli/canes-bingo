import { RequestHandler, Router } from 'express';

import {
  addUser,
  getUser,
  getUsers,
  removeUser,
  updateUser
} from '../controllers';
import { isAuthenticated } from './auth.router.ts';

const router = Router();

const list: RequestHandler = async (_req, res) => {
  try {
    const result = await getUsers();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message
    });
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    const result = await getUser(parseInt(req.params.userId));
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    const result = await updateUser(parseInt(req.params.userId), req.body);
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    const result = await addUser(req.body);
    res.status(201).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    const result = await removeUser(parseInt(req.params.userId));
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

router.route('/users')
  .post(isAuthenticated, post)
  .get(isAuthenticated, list);

router.route('/users/:userId')
  .get(isAuthenticated, get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
