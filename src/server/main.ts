import MySQLSession from 'express-mysql-session';
import ViteExpress from 'vite-express';
import session from 'express-session';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createConfig, attachRouting } from 'express-zod-api';

import { dbConfig } from './database';
import { routing } from './routing';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY environment variable is required');
}

const port = process.env.PORT || 3000;
const app = express();

const MySQLStore = MySQLSession(session);
const sessionStore = new MySQLStore({ ...dbConfig });

app.set('trust proxy', 1);

const isDev = process.env.NODE_ENV !== 'production';

app.use(helmet({
  // CSP disabled in dev: Vite's HMR injects inline scripts that can't satisfy a strict policy.
  // In production, we enumerate exactly what the app needs.
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'https://i.imgur.com'],
      connectSrc:  ["'self'", 'https://www.google-analytics.com', 'https://analytics.google.com', 'https://www.googletagmanager.com'],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/v1/login', loginLimiter);

app.use(session({
  secret: SECRET_KEY,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
}));

const config = createConfig({
  app,
  cors: false,
  logger: { level: 'info', color: true },
  inputSources: {
    get: ['query', 'params'],
    post: ['body', 'params'],
    put: ['body', 'params'],
    delete: ['params'],
    patch: ['body', 'params'],
  },
});

const { notFoundHandler } = attachRouting(config, routing);
app.use('/api', notFoundHandler);

const server = app.listen(port);

await ViteExpress.bind(app, server);
console.info(`Server is listening on port ${port}`);
