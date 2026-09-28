import confetti from 'canvas-confetti';

/**
 * Two confetti cannons in the bottom corners, fired on the same frame.
 *
 * The shape of the effect is entirely in these numbers, so they are named and
 * kept together rather than inlined at the call site:
 *
 * - `angle` 60 and 120 aim up and inward, so the two plumes cross the middle.
 *   A single call with a wide `spread` gives an omnidirectional pop instead,
 *   which is what this used to be.
 * - `spread` keeps each one a cone rather than a sphere.
 * - `startVelocity` high with `decay` below 1 puts the apex early and lets the
 *   rest of the flight be a slow flutter — paper reaches terminal velocity
 *   almost at once, so the fall should not read as accelerating.
 * - `gravity` just under 1 buys a little extra hang time.
 * - `ticks` is a particle lifetime in frames, so ~200 is about 3.3s at 60fps.
 */
const CANNON = {
  particleCount: 60,
  spread: 55,
  startVelocity: 55,
  decay: 0.9,
  gravity: 0.9,
  ticks: 200,
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

export function fireCannons(colors: string[] = FALLBACK_COLOURS) {
  const cannon = getFire();
  if (!cannon) return;

  const opts = { ...CANNON, colors };
  void cannon({ ...opts, ...LEFT_BARREL });
  void cannon({ ...opts, ...RIGHT_BARREL });
}

if (import.meta.env.DEV) {
  // Tuning handle: call `__cannons()` from the console, optionally with colours,
  // so the effect can be watched without completing a pattern first.
  (window as unknown as Record<string, unknown>).__cannons = fireCannons;
}
