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
import { nhlRouter } from './nhl-proxy';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY environment variable is required');
}

const port = process.env.PORT || 3000;
const app = express();

/**
 * One runtime object, two type identities.
 *
 * `@types/express-session` ships `"types": "index.d.ts"` alongside an empty
 * `"main": ""`. Under bundler resolution that one file ends up with two
 * identities — `…/express-session/index` for our import, and
 * `…/express-session/index.d.ts` for the one inside
 * `@types/express-mysql-session` — and TypeScript will not unify them.
 *
 * On top of that the factory declares its parameter as a *namespace* import,
 * which `esModuleInterop` gives a synthetic `default`. The value we have is
 * the *default* import, which the middleware call below needs and which has
 * no such property. So the two disagree twice over, about the same object.
 *
 * Asserted through `unknown` because a direct assertion is refused — the two
 * identities are held not to overlap. `Parameters<>` keeps the target tied to
 * the declaration rather than restating a type that could drift from it, so
 * the call is still checked against whatever the package actually declares.
 *
 * Nothing in this repo causes it and nothing here can fix it; it goes away
 * when the upstream types are packaged correctly.
 */
const MySQLStore = MySQLSession(
  session as unknown as Parameters<typeof MySQLSession>[0]
);

/**
 * `express-mysql-session` sweeps expired sessions on its own timer:
 *
 *   setInterval(this.clearExpiredSessions.bind(this), interval)
 *
 * It discards the promise that comes back, and `clearExpiredSessions` re-throws
 * after logging. So any failure in that sweep — a dropped connection, a revoked
 * grant, a DNS blip — becomes an unhandled rejection, and Node exits on those by
 * default. A background housekeeping query should never be able to take the
 * server down, so the sweep is run here instead, with its errors handled.
 *
 * The store's own startup path is already guarded, and it never emits an
 * `error` event, so `sessionStore.on('error', …)` would do nothing — the timer
 * really is the only unprotected path.
 *
 * Declared as a variable rather than inline because `clearExpired` is honoured
 * at runtime but missing from `@types/express-mysql-session`; passing an object
 * literal would trip excess-property checking.
 */
const sessionStoreOptions = { ...dbConfig, clearExpired: false };
const sessionStore = new MySQLStore(sessionStoreOptions);

/** Matches the library's own default of 15 minutes. */
const SESSION_SWEEP_MS = 15 * 60 * 1000;

/** The same types describe this as callback-based; it returns a promise. */
type SessionSweeper = { clearExpiredSessions: () => Promise<unknown> };

const sessionSweep = setInterval(() => {
  (sessionStore as unknown as SessionSweeper)
    .clearExpiredSessions()
    .catch((error: unknown) => {
      console.error('[sessions] failed to clear expired sessions:', error);
    });
}, SESSION_SWEEP_MS);
// Housekeeping should not be the reason the process stays alive.
sessionSweep.unref();

/**
 * Last resort. The sweep above was one instance of a general hazard: a rejected
 * promise nobody awaited will end the process. Logging and carrying on is the
 * right call for a web server, where a single failed background query should
 * cost one log line rather than everyone's session.
 *
 * `uncaughtException` is deliberately left alone — after one of those the
 * process state is unknown, and crashing so a supervisor can restart cleanly is
 * safer than limping on.
 */
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled promise rejection:', reason);
});

function parseTrustProxy(raw: string): boolean | number | string {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

// Configurable via TRUST_PROXY env var (e.g. '1', 'false', '127.0.0.1').
// Defaults to 1 (trust one hop) to support the typical nginx → app topology.
const rawTrustProxy = process.env.TRUST_PROXY ?? '1';
app.set('trust proxy', parseTrustProxy(rawTrustProxy));

const isDev = process.env.NODE_ENV !== 'production';

app.use(helmet({
  // CSP disabled in dev: Vite's HMR injects inline scripts that can't satisfy a strict policy.
  // In production, we enumerate exactly what the app needs.
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc:  ["'self'"],
      // Hash covers the static GTM init snippet in index.html.
    scriptSrc:   ["'self'", "'sha256-lix6OnV9laVmvGJmXa4ZU+rBhaioOyWzO28gqlHGBg4='", 'https://www.googletagmanager.com'],
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

/**
 * Square submissions are the only write anyone can make without logging in,
 * so the path gets its own bucket. Ten an hour is generous for a person with
 * an idea during a game and useless to anything bulk — and the ceiling is on
 * this route alone, so tripping it cannot lock someone out of the board.
 */
const submissionLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
app.use('/api/v1/submissions', submissionLimiter);

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
  startupLogo: false,
  logger: { level: 'info', color: true },
  inputSources: {
    get: ['query', 'params'],
    post: ['body', 'params'],
    put: ['body', 'params'],
    delete: ['params'],
    patch: ['body', 'params'],
  },
});

// Mounted before the express-zod-api 404 handler so it is not swallowed by it.
app.use('/api/nhl', nhlRouter);

const { notFoundHandler } = attachRouting(config, routing);
app.use('/api', notFoundHandler);

const server = app.listen(port);

await ViteExpress.bind(app, server);
console.info(`Server is listening on port ${port}`);
