import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import {
  addUser,
  authenticateUser,
  createUserToken,
  validateUserToken
} from '../controllers';
import { handleError } from '../utils.ts';

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const router = Router();

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Validate header token
  const auth = req.header('authorization') || '';
  const token = auth.split(/bearer\s+/i).pop();
  const user = await validateUserToken(token);
  if (!user) return res.status(401).send();
  // Validate session cookie
  const session = req.session.user;
  // Succeed!
  if (session && session.userId === user.id) {
    return next();
  }
  // Fail
  return req.session.save((err) => {
    if (err) return next(err);
    req.session.user = undefined;
    req.session.regenerate((err) => {
      if (err) return next(err);
      return res.status(401).send();
    });
  });
};

const login: RequestHandler = async (req, res, next) => {
  try {
    Joi.assert(req.body, userSchema);
    const { username, password } = req.body;
    const user = await authenticateUser({
      username,
      password,
    });
    if (user) {
      const { userId, username } = user;
      const token = createUserToken(user);
      return req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = { userId, username };
        req.session.save((err) => {
          if (err) return next(err);
          res.status(200).json({ token });
        });
      });
    }
    return res.status(401).send();
  } catch {
    return res.status(401).send();
  }
};

const logout: RequestHandler = async (req, res, next) => {
  try {
    return req.session.save((err) => {
      if (err) return next(err);
      req.session.user = undefined;
      req.session.regenerate((err) => {
        if (err) return next(err);
        return res.status(204).send();
      });
    });
  } catch (e: any) {
    return handleError(res, e);
  }
};

const register: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, userSchema);
    const { username, password } = req.body;
    const result = await addUser({
      username,
      password,
    });
    return res.status(201).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const session: RequestHandler = async (req, res) => {
  try {
    const { user } = req.session;
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(401).send();
    }
  } catch {
    return res.status(401).send();
  }
};

router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/session').get(session);
router.route('/register').post(register);

export default router;
