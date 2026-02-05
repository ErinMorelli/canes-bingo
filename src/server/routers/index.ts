import { Router } from 'express';

import auth from './auth.router.ts';
import categories from './categories.router.ts';
import config from './config.router.ts';
import groups from './groups.router.ts';
import games from './games.router.ts';
import patterns from './patterns.router.ts';
import squares from './squares.router.ts';
import users from './users.router.ts';

const router = Router();

router.use('/', auth);
router.use('/', categories);
router.use('/', config);
router.use('/', groups);
router.use('/', games);
router.use('/', patterns);
router.use('/', squares);
router.use('/', users);

export default router;
