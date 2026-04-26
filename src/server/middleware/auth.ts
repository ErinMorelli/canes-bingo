import createHttpError from 'http-errors';
import { Middleware } from 'express-zod-api';

export const authMiddleware = new Middleware({
  handler: async ({ request }) => {
    if (!request.session.user) throw createHttpError(401, 'Unauthorized');
    return {};
  },
});
