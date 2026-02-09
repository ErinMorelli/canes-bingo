import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addCategory,
  getCategories,
  getCategory,
  removeCategory,
  updateCategory
} from '../controllers';
import { handleError, resourceIdSchema } from '../utils.ts';

const categorySchema = Joi.object({
  name: Joi.string().required(),
  label: Joi.string().required(),
  description: Joi.string(),
  groupId: Joi.number(),
  isDefault: Joi.boolean(),
});

const router = Router();

const list: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.query, Joi.object({ group_id: Joi.string().pattern(/^\d+$/) }));
    const { group_id: groupId } = req.query;
    const parsedId = typeof groupId === 'string' ? Number.parseInt(groupId) : undefined;
    const result = await getCategories(parsedId);
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ categoryId: resourceIdSchema }));
    const { categoryId } = req.params;
    const result = await getCategory(Number.parseInt(categoryId));
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ categoryId: resourceIdSchema }));
    Joi.assert(req.body, categorySchema);

    const { categoryId } = req.params;
    const { name, label, description, isDefault, groupId } = req.body;

    const result = await updateCategory(Number.parseInt(categoryId), {
      name,
      label,
      description,
      isDefault,
      groupId,
    });
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, categorySchema);
    const { name, label, description, isDefault, groupId } = req.body;
    const result = await addCategory({
      name,
      label,
      description,
      isDefault,
      groupId,
    });
    return res.status(201).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ categoryId: resourceIdSchema }));
    const { categoryId } = req.params;
    const result = await removeCategory(Number.parseInt(categoryId));
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
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
