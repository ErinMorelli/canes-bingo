import { RequestHandler, Router } from 'express';

import {
  addConfig,
  getConfig,
  getConfigValue,
  getConfigValueByKey,
  removeConfig,
  updateConfig
} from '../controllers';
import { isAuthenticated } from './auth.router.ts';

const router = Router();

const list: RequestHandler = async (_req, res) => {
  try {
    const result = await getConfig();
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const get: RequestHandler = async (req, res) => {
  try {
    const { configId } = req.params;
    const result = !/\d+/.exec(configId)
      ? await getConfigValueByKey(configId)
      : await getConfigValue(parseInt(configId));
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

const put: RequestHandler = async (req, res) => {
  try {
    const result = await updateConfig(parseInt(req.params.configId), req.body);
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const post: RequestHandler = async (req, res) => {
  try {
    const result = await addConfig(req.body);
    res.status(201).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    const result = await removeConfig(parseInt(req.params.configId));
    res.status(200).json(result);
  } catch(e: any) {
    res.status(400).json({ message: e.message });
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
