import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addGroup,
  getGroups,
  getGroup,
  getGroupByName,
  removeGroup,
  updateGroup,
} from '../controllers';
import { handleError } from '../utils.ts';

const groupSchema = Joi.object({
  name: Joi.string().required(),
  label: Joi.string().required(),
  description: Joi.string(),
});

const router = Router();

const list: RequestHandler = async (_, res) => {
  try {
    const result = await getGroups();
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({
      groupId: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }));
    const { groupId } = req.params;
    const result = /^\d+$/.exec(groupId)
      ? await getGroup(Number.parseInt(groupId))
      : await getGroupByName(groupId);
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ groupId: Joi.number().required() }));
    Joi.assert(req.body, groupSchema);

    const { groupId } = req.params;
    const { name, label, description } = req.body;

    const result = await updateGroup(Number.parseInt(groupId), {
      name,
      label,
      description,
    });
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
}

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, groupSchema);
    const { name, label, description } = req.body;
    const result = await addGroup({
      name,
      label,
      description,
    });
    return res.status(201).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
}

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ groupId: Joi.number().required() }));
    const { groupId } = req.params;
    const result = await removeGroup(Number.parseInt(groupId));
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
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
