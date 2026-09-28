import { Board } from '@app/types';
import {
  SQUARE_FONT_FAMILY,
  fitSquareFont,
  squareKey,
  wrapSquareText,
} from '@app/utils';

/**
 * Draws the shareable card straight onto a canvas.
 *
 * This replaced an html2canvas rasterisation of a cloned board. The DOM it
 * cloned rendered correctly in the page — html2canvas 1.4.1 (unmaintained
 * since 2022) was what mangled it, and keeping it working meant maintaining a
 * second, rasteriser-safe stylesheet that had to mirror the real board. That
 * mirror is what drifted. Drawing explicitly is both fewer moving parts and
 * the only way to guarantee the output, since nothing here depends on how a
 * third party interprets CSS.
 *
 * Everything is laid out in the *board's own* units — a 150px cell, an 8px
 * gap, the same 10px padding and 12px radius as `.square` — and the whole
 * context is scaled once at the end. So the type ladder in `fitSquareFont`
 * applies unchanged and a label wraps in the image exactly where it wraps on
 * screen, rather than being re-fitted against some other cell size. That
 * mismatch was the second bug here: the clone inherited font sizes fitted for
 * a 150px cell into a 117px one, and the overflow was clipped away.
 */

/** Board geometry, matching the `$board-*` variables in style.scss. */
const CELL = 150;
const GAP = 8;
const RADIUS = 12;
const PADDING = 10;
/** Winning-square ring. Heavier than the board's 2.5px — see the note below. */
const RING = 5;
const BOARD = CELL * 5 + GAP * 4;

/** Frame around the board. */
const MARGIN = 40;
const TITLE_SIZE = 34;
const SUBTITLE_SIZE = 15;
const CAPTION_SIZE = 14;
const TITLE_TOP = 34;
const BOARD_TOP = 132;
const CAPTION_GAP = 34;

const WIDTH = BOARD + MARGIN * 2;
const HEIGHT = BOARD_TOP + BOARD + CAPTION_GAP + CAPTION_SIZE + MARGIN;

/** Two-up so the PNG still looks sharp pasted at full size. */
const SCALE = 2;

const TITLE_FONT_FAMILY = 'Anton, Arial, sans-serif';
const CAPTION = 'bingo.svech.net';

export type CardImageTheme = {
  /** The ground the card sits on. */
  ground: string;
  /** Title and primary text on that ground. */
  ink: string;
  /** Brand colour: the wordmark's second half, and a marked square. */
  accent: string;
  /** Secondary text. */
  muted: string;
  squareBg: string;
  squareText: string;
  freeBg: string;
  freeText: string;
};

export type CardImageOptions = {
  board: Board;
  theme: CardImageTheme;
  /** Left half of the wordmark, e.g. "Carolina Hurricanes". */
  headerText: string;
  /** The game being played, e.g. "Any Five". */
  gameName?: string;
  /** What the centre square reads — the operator can change it. */
  freeSpaceLabel: string;
  /** Keys of the squares that completed a pattern, if one is complete. */
  winningSquares?: ReadonlySet<string>;
  hasWon?: boolean;
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The board's own centred, wrapped label, drawn at the fitted size. */
function drawSquareText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  weight: string,
  colour: string
) {
  // `PADDING * 2` mirrors what Card.tsx measures off the live square, and the
  // 6px is the same breathing room `fitSquareFont` leaves for descenders.
  const fit = fitSquareFont(text, CELL, PADDING * 2, weight);
  if (!fit) return;

  const lines = wrapSquareText(text, fit.fontSize, weight, CELL - PADDING * 2 - 6);
  ctx.font = `${weight} ${fit.fontSize}px ${SQUARE_FONT_FAMILY}`;
  ctx.fillStyle = colour;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const top = cy - ((lines.length - 1) * fit.lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, cx, top + i * fit.lineHeight));
}

/** Centres a two-tone wordmark, measuring both halves so it stays centred. */
function drawWordmark(
  ctx: CanvasRenderingContext2D,
  left: string,
  right: string,
  y: number,
  theme: CardImageTheme
) {
  ctx.font = `${TITLE_SIZE}px ${TITLE_FONT_FAMILY}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const gap = ctx.measureText(' ').width;
  const leftWidth = ctx.measureText(left).width;
  const rightWidth = ctx.measureText(right).width;
  let x = (WIDTH - (leftWidth + gap + rightWidth)) / 2;

  ctx.fillStyle = theme.ink;
  ctx.fillText(left, x, y);
  x += leftWidth + gap;
  ctx.fillStyle = theme.accent;
  ctx.fillText(right, x, y);
}

export function renderCardImage({
  board,
  theme,
  headerText,
  gameName,
  freeSpaceLabel,
  winningSquares,
  hasWon = false,
}: CardImageOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * SCALE;
  canvas.height = HEIGHT * SCALE;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawWordmark(ctx, headerText.toUpperCase(), 'BINGO', TITLE_TOP + TITLE_SIZE, theme);

  // The strip under the wordmark says what was being played, and shouts when
  // the card is a winner — the same two facts the win bar carries.
  const subtitle = hasWon
    ? `BINGO! · ${gameName ?? ''}`.replace(/ · $/, '')
    : gameName;
  if (subtitle) {
    ctx.font = `600 ${SUBTITLE_SIZE}px ${SQUARE_FONT_FAMILY}`;
    ctx.fillStyle = hasWon ? theme.accent : theme.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(subtitle.toUpperCase(), WIDTH / 2, TITLE_TOP + TITLE_SIZE + 28);
  }

  board.forEach((row, rowId) => {
    row?.forEach((square, colId) => {
      const x = MARGIN + colId * (CELL + GAP);
      const y = BOARD_TOP + rowId * (CELL + GAP);
      const isFree = rowId === 2 && colId === 2;
      const isWinning = winningSquares?.has(squareKey({ row: rowId, col: colId })) ?? false;

      let bg = theme.squareBg;
      let fg = theme.squareText;
      if (square.selected) {
        bg = theme.accent;
        fg = '#FFFFFF';
      }
      if (isFree) {
        bg = theme.freeBg;
        fg = theme.freeText;
      }

      roundedRect(ctx, x, y, CELL, CELL, RADIUS);
      ctx.fillStyle = bg;
      ctx.fill();

      // The winning ring, inset like the board's `inset 0 0 0 2.5px`, but
      // twice as thick.
      //
      // Matching the board exactly was the first attempt and it was a mistake:
      // 2.5px against a 150px cell is 1.7% either way, but a shared card is
      // looked at scaled down — in a timeline, a thumbnail, a chat bubble —
      // and at those sizes the ring thinned to about a pixel and disappeared.
      // The board is viewed at 1:1 and can afford the finer line; this cannot.
      //
      // It takes the square's own text colour for the same reason the
      // stylesheet uses `currentColor`: white on an accent daub, and the free
      // space's inverse of whatever it is filled with, so the ring always has
      // contrast against the square under it.
      if (isWinning) {
        ctx.save();
        roundedRect(ctx, x + RING / 2, y + RING / 2, CELL - RING, CELL - RING, RADIUS - RING / 2);
        ctx.strokeStyle = fg;
        ctx.lineWidth = RING;
        ctx.stroke();
        ctx.restore();
      }

      const label = isFree ? freeSpaceLabel : String(square.value.value);
      drawSquareText(ctx, label, x + CELL / 2, y + CELL / 2, square.selected || isFree ? '700' : '500', fg);
    });
  });

  ctx.font = `500 ${CAPTION_SIZE}px ${SQUARE_FONT_FAMILY}`;
  ctx.fillStyle = theme.muted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(CAPTION, WIDTH / 2, BOARD_TOP + BOARD + CAPTION_GAP);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
