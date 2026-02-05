import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addUser,
  getUser,
  getUsers,
  removeUser,
  updateUser
} from '../controllers';
import { handleError } from '../utils.ts';

const newUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string(),
});

const router = Router();

const list: RequestHandler = async (_req, res) => {
  try {
    const result = await getUsers();
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ userId: Joi.number().required() }));
    const { userId } = req.params;
    const result = await getUser(Number.parseInt(userId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ userId: Joi.number().required() }));
    Joi.assert(req.body, updateUserSchema);

    const { userId } = req.params;
    const { username, password } = req.body;

    const result = await updateUser(Number.parseInt(userId), {
      username,
      password,
    });
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, newUserSchema);
    const { username, password } = req.body;
    const result = await addUser({
      username,
      password,
    });
    return res.status(201).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ userId: Joi.number().required() }));
    const { userId } = req.params;
    const result = await removeUser(Number.parseInt(userId));
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
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
