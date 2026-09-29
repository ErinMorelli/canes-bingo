import confetti from 'canvas-confetti';

/**
 * Two confetti cannons in the bottom corners, fired on the same frame.
 *
 * The shape of the effect is entirely in these numbers, so they are named and
 * kept together rather than inlined at the call site. Two things about
 * canvas-confetti's model drive most of the choices, and neither is what the
 * names suggest:
 *
 * - `decay` multiplies velocity *every frame*. At 0.9 a particle keeps only
 *   0.9^10 ≈ 35% of its launch speed after a sixth of a second, so nearly all
 *   the travel happens in the first few frames and the plumes stall low and
 *   near the barrels. Total rise is roughly `startVelocity * sin(angle) /
 *   (1 - decay)`, so decay — not `startVelocity` — is the height control: the
 *   step from 0.90 to 0.92 alone is worth a quarter more reach.
 * - `gravity` is a constant downward *offset per frame*, not an acceleration,
 *   which is right for paper (it hits terminal velocity almost at once) but
 *   means the descent is linear and slow. Paired with the old `ticks: 200`
 *   (3.3s) the particles were expiring at or just past their apex, so the
 *   effect read as stalling in mid-air instead of falling back.
 *
 * So: `decay` and `startVelocity` set how high, `gravity` and `ticks` decide
 * how much of the way back down is actually seen. `ticks` has to stay well
 * ahead of the flight — canvas-confetti fades each particle linearly across
 * its own lifetime, and that fade should land during the descent, not at the
 * top of the arc.
 *
 * `angle` 60 and 120 aim up and inward so the two plumes cross overhead, and
 * `spread` keeps each one a cone rather than a sphere.
 */
const CANNON = {
  particleCount: 105,
  spread: 60,
  startVelocity: 75,
  decay: 0.92,
  gravity: 1.8,
  ticks: 300,
  scalar: 0.9,
  shapes: ['square', 'circle'] as confetti.Shape[],
  disableForReducedMotion: true,
};

/** Fired from the bottom corners of the viewport, like a cannon on the floor. */
const LEFT_BARREL = { angle: 60, origin: { x: 0, y: 0.95 } };
const RIGHT_BARREL = { angle: 120, origin: { x: 1, y: 0.95 } };

const FALLBACK_COLOURS = ['#CE1126', '#FFFFFF', '#A4A9AD', '#000000'];

let fire: confetti.CreateTypes | null = null;

/**
 * Binds the effect to a canvas of our own rather than the library's default,
 * so this element's `z-index` decides what the confetti passes in front of —
 * the library otherwise plants itself at `zIndex: 100`.
 *
 * `useWorker` is off deliberately. It would move the particle loop to an
 * OffscreenCanvas on a worker thread, but transferring control makes the
 * canvas unreadable from the main thread, and there is no way left to confirm
 * anything is being drawn. 120 sprites in one rAF loop is not a measurable
 * cost, so the verifiable path wins over the marginally cheaper one.
 *
 * Created on first use, so a session that never wins never pays for it.
 */
function getFire(): confetti.CreateTypes | null {
  if (fire) return fire;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  fire = confetti.create(canvas, { resize: true, useWorker: false });
  return fire;
}

/**
 * `tuning` exists for the dev handle below and is not passed by the app, which
 * always fires the shape defined in CANNON.
 */
export function fireCannons(
  colors: string[] = FALLBACK_COLOURS,
  tuning: Partial<typeof CANNON> = {}
) {
  const cannon = getFire();
  if (!cannon) return;

  const opts = { ...CANNON, ...tuning, colors };
  void cannon({ ...opts, ...LEFT_BARREL });
  void cannon({ ...opts, ...RIGHT_BARREL });
}

if (import.meta.env.DEV) {
  // Tuning handles, so the arc can be watched and altered without completing a
  // pattern first or editing this file:
  //   __cannons()                          — fire as shipped
  //   __cannons(null, { decay: 0.94 })     — fire with one value changed
  //   __cannonSpec                         — read the current numbers
  const w = window as unknown as Record<string, unknown>;
  w.__cannons = (colors?: string[] | null, tuning?: Partial<typeof CANNON>) =>
    fireCannons(colors ?? FALLBACK_COLOURS, tuning ?? {});
  w.__cannonSpec = { ...CANNON };
}
