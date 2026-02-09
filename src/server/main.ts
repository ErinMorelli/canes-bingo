import MySQLSession from 'express-mysql-session';
import ViteExpress from 'vite-express';
import session from 'express-session';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

import { dbConfig } from './database.ts';
import apiRouter from './routers';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY environment variable is required');
}

const port = process.env.PORT || 3000;

const app = express();

const MySQLStore = MySQLSession(session);
const sessionStore = new MySQLStore({...dbConfig});

app.set('trust proxy', 1);

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(bodyParser.json());

app.use(session({
  secret: SECRET_KEY,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
}));

app.use('/api/v1', apiRouter);

const server = app.listen(port);

await ViteExpress.bind(app, server);
console.info(`Server is listening on port ${port}`);
