import { RequestHandler, Router } from 'express';
import Joi from 'joi';

import { isAuthenticated } from './auth.router.ts';

import {
  addConfig,
  getConfig,
  getConfigValue,
  getConfigValueByKey,
  removeConfig,
  updateConfig
} from '../controllers';
import { handleError } from '../utils.ts';

const configSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required(),
});

const router = Router();

const list: RequestHandler = async (_req, res) => {
  try {
    const result = await getConfig();
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({
      configId: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }));
    const { configId } = req.params;
    const result = /^\d+$/.exec(configId)
      ? await getConfigValue(Number.parseInt(configId))
      : await getConfigValueByKey(configId);
    return res.status(200).json(result);
  } catch (e: any) {
    return handleError(res, e);
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ configId: Joi.number().required() }));
    Joi.assert(req.body, configSchema);

    const { configId } = req.params;
    const { key, value } = req.body;

    const result = await updateConfig(Number.parseInt(configId), {
      key,
      value,
    });
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.body, configSchema);
    const { key, value } = req.body;
    const result = await addConfig({ key, value });
    return res.status(201).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    Joi.assert(req.params, Joi.object({ configId: Joi.number().required() }));
    const { configId } = req.params;
    const result = await removeConfig(Number.parseInt(configId));
    return res.status(200).json(result);
  } catch(e: any) {
    return handleError(res, e);
  }
};

router.route('/config')
  .get(list)
  .post(isAuthenticated, post);

router.route('/config/:configId')
  .get(get)
  .put(isAuthenticated, put)
  .delete(isAuthenticated, remove);

export default router;
