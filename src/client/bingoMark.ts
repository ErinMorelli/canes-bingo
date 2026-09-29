/**
 * The app mark, as an SVG the browser can use for a favicon.
 *
 * Ported from `BingoMark.dc.html` in the design project. A 2×2 card whose two
 * marked cells are hurricane warning flags on the diagonal: the nautical
 * storm signal is a red square with a black square centred in it, which
 * happens to be the same geometry as a daubed cell. That coincidence is the
 * whole idea.
 *
 * Two of the explorations ship, because no single cut holds on every ground:
 *
 *  - `outline` (3b) — white card, unmarked cells as hairline outlines. The
 *    flags are the only solid objects, which is how the board actually looks.
 *  - `dark` (3c) — slate card, unmarked cells as a lifted fill. The cut that
 *    survives against a dark tab strip, where white grounds dissolve.
 *
 * Built as strings rather than shipped as files because every shape is a flat
 * rect. Recolouring is a token swap, so the mark can be rebuilt per theme at
 * runtime with no assets and no build step.
 */

export type MarkVariant = 'outline' | 'dark';

export type MarkColours = {
  variant: MarkVariant;
  /** The tile behind everything. This is what carries the theme. */
  ground: string;
  /** The warning flags. */
  flag: string;
  /** The square centred in each flag, which is what makes it the signal. */
  centre: string;
  /**
   * The two unmarked cells: a stroke on `outline`, a solid fill on `dark`
   * (already blended against the ground, so no alpha is involved).
   */
  empty: string;
};

/**
 * iOS squircles sit near 22% of the tile. Kept here so the favicon and any
 * future touch icon round identically.
 */
const CORNER_RATIO = 0.22;
const VIEWBOX = 64;

/** Stroke width for `outline`'s unmarked cells, in viewBox units. */
const OUTLINE_STROKE = 2.5;

/*
  Geometry is verbatim from the design file. 25-unit cells at 5 and 34 leave a
  4-unit gutter and push the card to the tile edge; the 9-unit centres at 13
  and 42 sit dead centre of each flag. Changing any of these is a design
  change, not a cleanup.

  The outlined cells are inset by half a stroke (1.25) and shrunk by a full
  one, because SVG centres a stroke on its path — without that the outline
  would sit proud of the 25-unit cell the filled version occupies, and the two
  variants would not line up.
*/
function flagCells(flag: string, centre: string): string[] {
  return [
    `<rect x="5" y="5" width="25" height="25" rx="3.5" fill="${flag}"/>`,
    `<rect x="13" y="13" width="9" height="9" rx="1.2" fill="${centre}"/>`,
    `<rect x="34" y="34" width="25" height="25" rx="3.5" fill="${flag}"/>`,
    `<rect x="42" y="42" width="9" height="9" rx="1.2" fill="${centre}"/>`,
  ];
}

function emptyCells(variant: MarkVariant, empty: string): string[] {
  if (variant === 'dark') {
    return [
      `<rect x="34" y="5" width="25" height="25" rx="3.5" fill="${empty}"/>`,
      `<rect x="5" y="34" width="25" height="25" rx="3.5" fill="${empty}"/>`,
    ];
  }

  const inset = OUTLINE_STROKE / 2;
  const size = 25 - OUTLINE_STROKE;
  const box = (x: number, y: number) =>
    `<rect x="${x + inset}" y="${y + inset}" width="${size}" height="${size}" rx="3" `
    + `fill="none" stroke="${empty}" stroke-width="${OUTLINE_STROKE}"/>`;
  return [box(34, 5), box(5, 34)];
}

export function buildMarkSvg({ variant, ground, flag, centre, empty }: MarkColours): string {
  const rx = (VIEWBOX * CORNER_RATIO).toFixed(2);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">`,
    `<rect width="64" height="64" rx="${rx}" fill="${ground}"/>`,
    // Empties first so the flags paint over them, as in the design file.
    ...emptyCells(variant, empty),
    ...flagCells(flag, centre),
    `</svg>`,
  ].join('');
}

/**
 * The SVG as a `data:` URI a `<link rel="icon">` will accept.
 *
 * `encodeURIComponent` rather than base64: the markup is ASCII, so percent
 * encoding keeps it readable in devtools and avoids pulling in `btoa`, which
 * throws on any non-Latin-1 character a future variant might introduce. The
 * escaping is not cosmetic — an unencoded `#` opens a URL fragment and
 * truncates the icon to a bare ground, which renders as a blank square.
 */
export function markDataUri(colours: MarkColours): string {
  return `data:image/svg+xml,${encodeURIComponent(buildMarkSvg(colours))}`;
}
