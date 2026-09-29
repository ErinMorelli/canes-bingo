import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * These all count *upstream* calls, because that is the resource every
 * control here protects: nhle.com is the thing we can get blocked from, and
 * the server's memory is the thing an open key space can exhaust.
 *
 * The module holds its cache, in-flight map and token bucket in module scope,
 * so every test re-imports it through `vi.resetModules()` for a clean slate
 * rather than the module exporting a reset hook that only tests would call.
 */

type Loaded = typeof import('./nhl-proxy');

async function loadFresh(): Promise<Loaded> {
  vi.resetModules();
  return await import('./nhl-proxy');
}

function jsonOnce(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

function failure(status: number) {
  return { ok: false, status, json: async () => ({}) } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  // The proxy aborts on a timeout; fake timers make the real one unusable.
  vi.stubGlobal('AbortSignal', { timeout: () => undefined });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('nhl proxy caching', () => {
  it('serves a repeat inside the TTL without calling upstream again', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(jsonOnce({ score: 1 }));

    expect(await fetchNhl('/a')).toEqual({ score: 1 });
    expect(await fetchNhl('/a')).toEqual({ score: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('goes back upstream once the TTL has passed', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(jsonOnce({ score: 1 }));

    await fetchNhl('/a');
    vi.advanceTimersByTime(10_001);
    await fetchNhl('/a');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('nhl proxy in-flight coalescing', () => {
  it('collapses simultaneous misses into one upstream call', async () => {
    const { fetchNhl } = await loadFresh();

    // Boards poll in lockstep, so an expiry releases them all at once.
    let release!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((res) => { release = res; }));

    const all = Promise.all([fetchNhl('/a'), fetchNhl('/a'), fetchNhl('/a')]);
    release(jsonOnce({ score: 2 }));

    expect(await all).toEqual([{ score: 2 }, { score: 2 }, { score: 2 }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('lets the next caller retry after an in-flight request fails', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    await expect(fetchNhl('/a')).rejects.toThrow('network down');

    // The failure is cached, so this one is served from that rather than
    // re-fetching — but the in-flight slot must have been released either way.
    fetchMock.mockResolvedValue(jsonOnce({ ok: true }));
    await expect(fetchNhl('/a')).rejects.toThrow('network down');
    vi.advanceTimersByTime(60_001);
    await expect(fetchNhl('/a')).resolves.toEqual({ ok: true });
  });
});

describe('nhl proxy negative caching', () => {
  it('does not re-call upstream for a repeated bad id', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(failure(404));

    // The amplification path: a public route where any ten digits reach the
    // NHL API, hit over and over.
    for (let i = 0; i < 10; i += 1) {
      await expect(fetchNhl('/gamecenter/2099021234/landing')).rejects.toThrow();
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a failed path once the failure TTL lapses', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(failure(500));

    await expect(fetchNhl('/a')).rejects.toThrow();
    vi.advanceTimersByTime(60_001);
    await expect(fetchNhl('/a')).rejects.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('nhl proxy cache bounds', () => {
  it('evicts the oldest once past the ceiling, while newer ids stay cached', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(jsonOnce({ big: 'payload' }));

    /*
      70 distinct ids against a 64-entry ceiling. Paced at 80ms so the token
      bucket can afford them (60 burst + ~11 refilled), and the whole run
      still fits inside one 10s TTL — otherwise an eviction here could not be
      told apart from an expiry.
    */
    const id = (i: number) => `/gamecenter/20990212${String(i).padStart(2, '0')}/landing`;
    for (let i = 0; i < 70; i += 1) {
      await fetchNhl(id(i));
      vi.advanceTimersByTime(80);
    }

    // Nothing exposes the map, so probe behaviour: the earliest ids should
    // have been displaced and cost a fresh call...
    const beforeOldest = fetchMock.mock.calls.length;
    await fetchNhl(id(0));
    expect(fetchMock.mock.calls.length).toBe(beforeOldest + 1);

    // ...while a recent one is still served from cache.
    const beforeRecent = fetchMock.mock.calls.length;
    await fetchNhl(id(69));
    expect(fetchMock.mock.calls.length).toBe(beforeRecent);
  });
});

describe('nhl proxy upstream budget', () => {
  it('stops calling upstream once the burst is spent', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(jsonOnce({ n: 1 }));

    // 60 distinct paths spends the whole burst; the refill over this many
    // synchronous ticks is negligible.
    for (let i = 0; i < 60; i += 1) await fetchNhl(`/p${i}`);
    const spent = fetchMock.mock.calls.length;

    await expect(fetchNhl('/never-seen')).rejects.toThrow(/budget exhausted/);
    expect(fetchMock.mock.calls.length).toBe(spent);
  });

  it('serves stale data rather than failing when the budget is gone', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(jsonOnce({ score: 3 }));

    await fetchNhl('/game');           // cached
    vi.advanceTimersByTime(10_001);    // now stale
    // Spend the burst. 10s of refill put it back at the 60 cap, so this
    // drains it again without displacing `/game` from the 64-entry cache.
    for (let i = 0; i < 60; i += 1) await fetchNhl(`/p${i}`);

    // A stale scoreboard beats an error state.
    await expect(fetchNhl('/game')).resolves.toEqual({ score: 3 });
  });

  it('refills over time', async () => {
    const { fetchNhl } = await loadFresh();
    fetchMock.mockResolvedValue(jsonOnce({ n: 1 }));

    for (let i = 0; i < 60; i += 1) await fetchNhl(`/p${i}`);
    await expect(fetchNhl('/x')).rejects.toThrow(/budget exhausted/);

    vi.advanceTimersByTime(1_000);     // 2 per second
    await expect(fetchNhl('/y')).resolves.toEqual({ n: 1 });
  });
});
