import { RequestHandler, Router } from 'express';

import {
  addGroup,
  getGroups,
  getGroup,
  getGroupByName,
  removeGroup,
  updateGroup,
} from '../controllers';
import { isAuthenticated } from './auth.router.ts';

const router = Router();

const list: RequestHandler = async (_, res) => {
  try {
    const result = await getGroups();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message
    });
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = !/\d+/.exec(groupId)
      ? await getGroupByName(groupId)
      : await getGroup(parseInt(groupId));
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message
    });
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    const result = await updateGroup(parseInt(req.params.groupId), req.body);
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
}

const post: RequestHandler = async (req, res) => {
  try {
    const result = await addGroup(req.body);
    res.status(201).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
}

const remove: RequestHandler = async (req, res) => {
  try {
    const result = await removeGroup(parseInt(req.params.groupId));
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
}

router.route('/groups')
  .get(list)
  .post(isAuthenticated, post);

router.route('/groups/:groupId')
  .get(get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
