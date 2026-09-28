import { Router } from 'express';

const NHL_API_ROOT = 'https://api-web.nhle.com/v1';
const TEAM = 'CAR';

// api-web.nhle.com sends no Access-Control-Allow-Origin on any response, so the
// browser cannot call it directly. Proxying through our own origin also keeps
// the production CSP's `connectSrc: 'self'` intact.

// Every connected board polls on the same cadence, so without a short cache a
// roomful of clients multiplies straight through to the NHL API.
const CACHE_TTL_MS = 10_000;

/** Past this the NHL API is not going to answer in time to be useful. */
const UPSTREAM_TIMEOUT_MS = 5_000;
const cache = new Map<string, { expires: number; body: unknown }>();

async function fetchNhl(path: string): Promise<unknown> {
  const cached = cache.get(path);
  if (cached && cached.expires > Date.now()) return cached.body;

  // The `/now` URLs answer 307 with a dated Location; fetch follows by default.
  // Bounded: without a signal a hung upstream holds our own request open with
  // no ceiling, and every polling board is waiting on it.
  const response = await fetch(`${NHL_API_ROOT}${path}`, {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`NHL API ${path} failed: ${response.status}`);
  }

  const body = await response.json();
  cache.set(path, { expires: Date.now() + CACHE_TTL_MS, body });
  return body;
}

export const nhlRouter = Router();

nhlRouter.get('/schedule', async (_req, res) => {
  try {
    res.json(await fetchNhl(`/club-schedule/${TEAM}/week/now`));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Unable to reach the NHL API' });
  }
});

nhlRouter.get('/game/:gameId', async (req, res) => {
  const { gameId } = req.params;

  // Upstream paths are built only from allowlisted shapes, never free-form input.
  if (!/^\d{10}$/.test(gameId)) {
    res.status(400).json({ error: 'Invalid game id' });
    return;
  }

  try {
    res.json(await fetchNhl(`/gamecenter/${gameId}/landing`));
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Unable to reach the NHL API' });
  }
});
