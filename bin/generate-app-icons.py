#!/usr/bin/env python3
"""Render the app icons from the 3b mark.

The favicon is drawn at runtime from `src/client/bingoMark.ts` and follows the
theme. These files cannot: an installed home-screen icon is captured at install
time and never consulted again, so one cut has to stand for all three themes.
3b is it.

Colours are read out of `src/client/themes.ts` rather than restated here, so a
token change there is picked up by a re-run instead of silently leaving these
files behind. Run from the repo root:

    python3 bin/generate-app-icons.py
"""

from __future__ import annotations

import pathlib
import re
import sys

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
THEMES = ROOT / 'src' / 'client' / 'themes.ts'
PUBLIC = ROOT / 'public'

# One viewBox unit. Every coordinate below is in these, matching bingoMark.ts.
VIEWBOX = 64
CORNER_RATIO = 0.22
OUTLINE_STROKE = 2.5

# Supersampling factor. The outline is 2.5 units wide, which at a 16px target
# is well under a pixel, so it has to be resolved at size and averaged down
# rather than snapped to the pixel grid.
SS = 8


def read_mark_colours() -> dict[str, str]:
    """Pull the `default` (3b) entry out of themes.ts.

    Parsed rather than duplicated. If the shape of that file changes this
    raises instead of quietly rendering the wrong colours — stale icons that
    look plausible are worse than a failed run.
    """
    src = THEMES.read_text()
    block = re.search(r'markColours[^=]*=\s*\{(.*?)\n\};', src, re.S)
    if not block:
        sys.exit('Could not find markColours in themes.ts')

    default = re.search(r'\bdefault:\s*\{(.*?)\}', block.group(1), re.S)
    if not default:
        sys.exit('Could not find the default entry in markColours')

    # Parsed line by line rather than with a `(\w+):\s*'([^']+)'` sweep. That
    # pattern backtracks super-linearly, and while the input here is our own
    # small themes.ts, a quantifier that can blow up is not worth keeping when
    # the entries are one flat `key: 'value',` per line anyway. Splitting also
    # avoids possessive quantifiers, which would pin this script to 3.11+.
    found: dict[str, str] = {}
    for entry in default.group(1).splitlines():
        key, sep, rest = entry.partition(':')
        key = key.strip()
        value = rest.strip().rstrip(',').strip()
        if sep and key.isidentifier() and len(value) >= 2 and value[0] == value[-1] == "'":
            found[key] = value[1:-1]
    missing = {'variant', 'ground', 'flag', 'centre', 'empty'} - found.keys()
    if missing:
        sys.exit(f'markColours.default is missing {sorted(missing)}')
    if found['variant'] != 'outline':
        sys.exit(f"Expected the default theme to use the outline cut, got {found['variant']!r}")
    return found


def render(size: int, colours: dict[str, str], rounded: bool) -> Image.Image:
    """Draw the mark at `size` px.

    `rounded` is false for the touch and Android icons: both platforms apply
    their own mask, and baking a radius in leaves transparent notches showing
    through the corners of theirs.
    """
    px = size * SS
    unit = px / VIEWBOX

    def u(v: float) -> float:
        return v * unit

    img = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    ground_radius = u(VIEWBOX * CORNER_RATIO) if rounded else 0
    draw.rounded_rectangle([0, 0, px - 1, px - 1], radius=ground_radius, fill=colours['ground'])

    # Unmarked cells: inset half a stroke and shrunk by a whole one, because a
    # stroke straddles its path. Same correction as the SVG.
    inset = OUTLINE_STROKE / 2
    side = 25 - OUTLINE_STROKE
    for x, y in ((34, 5), (5, 34)):
        draw.rounded_rectangle(
            [u(x + inset), u(y + inset), u(x + inset + side), u(y + inset + side)],
            radius=u(3),
            outline=colours['empty'],
            width=max(1, round(u(OUTLINE_STROKE))),
        )

    # The two warning flags, each with its centred square.
    for fx, fy, cx, cy in ((5, 5, 13, 13), (34, 34, 42, 42)):
        draw.rounded_rectangle([u(fx), u(fy), u(fx + 25), u(fy + 25)],
                               radius=u(3.5), fill=colours['flag'])
        draw.rounded_rectangle([u(cx), u(cy), u(cx + 9), u(cy + 9)],
                               radius=u(1.2), fill=colours['centre'])

    return img.resize((size, size), Image.LANCZOS)


def flatten(img: Image.Image, background: str) -> Image.Image:
    """Drop the alpha channel. Home-screen icons must not be transparent."""
    opaque = Image.new('RGB', img.size, background)
    opaque.paste(img, mask=img.split()[3])
    return opaque


def main() -> None:
    colours = read_mark_colours()
    print('Using markColours.default from themes.ts:')
    for key in ('ground', 'flag', 'centre', 'empty'):
        print(f'  {key:7} {colours[key]}')
    print()

    written: list[tuple[str, str]] = []

    # Tab icons keep the rounded corners; nothing masks these.
    for size in (16, 32):
        path = PUBLIC / f'favicon-{size}x{size}.png'
        render(size, colours, rounded=True).save(path)
        written.append((path.name, f'{size}x{size} rounded, transparent corners'))

    # Multi-size ICO for anything still asking for /favicon.ico.
    ico = PUBLIC / 'favicon.ico'
    render(64, colours, rounded=True).save(ico, format='ICO',
                                           sizes=[(16, 16), (32, 32), (48, 48)])
    written.append((ico.name, '16/32/48 rounded'))

    # Home-screen icons: square and opaque, so iOS and Android mask cleanly.
    for name, size in (('apple-touch-icon.png', 180),
                       ('android-chrome-192x192.png', 192),
                       ('android-chrome-512x512.png', 512)):
        path = PUBLIC / name
        flatten(render(size, colours, rounded=False), colours['ground']).save(path)
        written.append((name, f'{size}x{size} square, opaque'))

    for name, note in written:
        print(f'  wrote {name:28} {note}')


if __name__ == '__main__':
    main()
