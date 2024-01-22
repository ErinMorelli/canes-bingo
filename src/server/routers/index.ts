import { Router } from 'express';

import { default as auth } from './auth.router.ts';
import { default as categories } from './categories.router.ts';
import { default as config } from './config.router.ts';
import { default as groups } from './groups.router.ts';
import { default as squares } from './squares.router.ts';
import { default as users } from './users.router.ts';

const router = Router();

router.use('/', categories);
router.use('/', config);
router.use('/', groups);
router.use('/', squares);
router.use('/', users);
router.use('/', auth);

export default router;
