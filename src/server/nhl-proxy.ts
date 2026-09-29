import { Router } from 'express';

const NHL_API_ROOT = 'https://api-web.nhle.com/v1';
const TEAM = 'CAR';

// api-web.nhle.com sends no Access-Control-Allow-Origin on any response, so the
// browser cannot call it directly. Proxying through our own origin also keeps
// the production CSP's `connectSrc: 'self'` intact.

// Every connected board polls on the same cadence, so without a short cache a
// roomful of clients multiplies straight through to the NHL API.
const CACHE_TTL_MS = 10_000;

/**
 * Failures are cached too, and for longer.
 *
 * These routes are public and the game id is only shape-checked, so any
 * well-formed ten-digit number reaches the NHL API. Without this, a caller
 * repeating one bad id turns every request into an upstream call. Longer than
 * the success TTL because a 404 is a fact about the id, not a stale reading.
 */
const FAILURE_TTL_MS = 60_000;

/**
 * Cache ceiling. The id is any ten digits, so the key space is effectively
 * unbounded and the entries hold whole gamecenter payloads; uncapped, the map
 * grows for as long as distinct ids keep arriving.
 *
 * Far more than real use needs: one schedule plus the handful of games a
 * board might look at.
 */
const MAX_CACHE_ENTRIES = 64;

/** Past this the NHL API is not going to answer in time to be useful. */
const UPSTREAM_TIMEOUT_MS = 5_000;

/**
 * A budget on *upstream* calls rather than a rate limit on inbound requests.
 *
 * A per-IP limit is the obvious control and the wrong one here: during live
 * play each board polls every fifteen seconds, so a watch party sharing one
 * wifi is legitimately dozens of requests a minute from a single address.
 * Limiting that breaks the case the site exists for.
 *
 * What is actually scarce is calls to nhle.com — the thing we can be blocked
 * for. Cached responses still serve everyone, so honest traffic barely spends
 * from this: one schedule every fifteen minutes plus one game every ten
 * seconds is about 0.1/s against the 2/s below.
 */
const UPSTREAM_BURST = 60;
const UPSTREAM_REFILL_PER_SECOND = 2;

type CacheEntry =
  | { kind: 'ok'; expires: number; body: unknown }
  | { kind: 'error'; expires: number; message: string };

const cache = new Map<string, CacheEntry>();

/**
 * Requests already on the wire, keyed by path.
 *
 * Boards poll in lockstep, so a cache expiry releases all of them at once and
 * each of those misses used to become its own upstream call. They share one.
 */
const inFlight = new Map<string, Promise<unknown>>();

let tokens = UPSTREAM_BURST;
let lastRefill = Date.now();

function takeUpstreamToken(): boolean {
  const now = Date.now();
  const refill = ((now - lastRefill) / 1000) * UPSTREAM_REFILL_PER_SECOND;
  tokens = Math.min(UPSTREAM_BURST, tokens + refill);
  lastRefill = now;

  if (tokens < 1) return false;
  tokens -= 1;
  return true;
}

/**
 * Stores an entry and trims to the ceiling, oldest write first.
 *
 * Expired entries are deliberately *not* swept. The ceiling is what bounds
 * memory, and an expired entry is still the last known good answer — sweeping
 * it would throw away exactly what the budget fallback below serves when
 * upstream is off limits. So they age out by being displaced, not by the
 * clock.
 */
function remember(path: string, entry: CacheEntry): void {
  // Re-inserting moves the key to the end — a Map iterates in insertion
  // order, which is what makes the trim below drop the oldest.
  cache.delete(path);
  cache.set(path, entry);

  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

async function callUpstream(path: string): Promise<unknown> {
  if (!takeUpstreamToken()) {
    /*
      Out of budget. Stale beats nothing — a scoreboard ten seconds behind is
      invisible next to an error state, and this only happens when something
      is already hammering the route.
    */
    const stale = cache.get(path);
    if (stale?.kind === 'ok') return stale.body;
    throw new Error(`NHL API ${path} skipped: upstream budget exhausted`);
  }

  try {
    // The `/now` URLs answer 307 with a dated Location; fetch follows by default.
    // Bounded: without a signal a hung upstream holds our own request open with
    // no ceiling, and every polling board is waiting on it.
    const response = await fetch(`${NHL_API_ROOT}${path}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`NHL API ${path} failed: ${response.status}`);
    }

    const body: unknown = await response.json();
    remember(path, { kind: 'ok', expires: Date.now() + CACHE_TTL_MS, body });
    return body;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    remember(path, { kind: 'error', expires: Date.now() + FAILURE_TTL_MS, message });
    throw error;
  }
}

export async function fetchNhl(path: string): Promise<unknown> {
  const cached = cache.get(path);
  if (cached && cached.expires > Date.now()) {
    if (cached.kind === 'error') throw new Error(cached.message);
    return cached.body;
  }

  const pending = inFlight.get(path);
  if (pending) return pending;

  const request = (async () => {
    try {
      return await callUpstream(path);
    } finally {
      inFlight.delete(path);
    }
  })();

  inFlight.set(path, request);
  return request;
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
