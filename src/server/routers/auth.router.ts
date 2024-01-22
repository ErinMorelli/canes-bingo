import { RequestHandler, Router } from 'express';

import {
  addUser,
  authenticateUser,
  createUserToken,
  validateUserToken
} from '../controllers';

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
  req.session.save((err) => {
    if (err) return next(err);
    req.session.user = undefined;
    req.session.regenerate((err) => {
      if (err) return next(err);
      res.status(401).send();
    });
  });
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await authenticateUser(req.body);
    if (!user) {
      res.status(401).send();
    } else {
      const { userId, username } = user;
      const token = createUserToken(user);
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = { userId, username };
        req.session.save((err) => {
          if (err) return next(err);
          res.status(200).json({ token });
        });
      });
    }
  } catch (e: any) {
    res.status(401).send();
  }
};

const logout: RequestHandler = async (req, res, next) => {
  try {
    req.session.save((err) => {
      if (err) return next(err);
      req.session.user = undefined;
      req.session.regenerate((err) => {
        if (err) return next(err);
        res.status(204).send();
      });
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const register: RequestHandler = async (req, res) => {
  try {
    const result = await addUser(req.body);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const session: RequestHandler = async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      res.status(401).send();
    } else {
      res.status(200).json(user);
    }
  } catch (e: any) {
    res.status(401).send();
  }
};

router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/session').get(session);
router.route('/register').post(register);

export default router;
