import type { Request, Response, NextFunction } from 'express';
import { defaultEndpointsFactory } from 'express-zod-api';

import { authMiddleware } from '../middleware/auth';

const requestProvider = {
  provider: (req: Request) => ({ request: req }),
};

const passThroughMw = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export const publicFactory = defaultEndpointsFactory.use(passThroughMw, requestProvider);

export const authFactory = defaultEndpointsFactory
  .addMiddleware(authMiddleware)
  .use(passThroughMw, requestProvider);
