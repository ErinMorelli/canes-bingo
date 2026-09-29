import { describe, it, expect } from 'vitest';

import { buildMarkSvg, markDataUri } from './bingoMark';
import type { MarkColours } from './bingoMark';
import { markColours } from './themes';

const DARK: MarkColours = { variant: 'dark', ground: '#333F48', flag: '#CE1126', centre: '#000000', empty: '#545E65' };
const OUTLINE: MarkColours = { variant: 'outline', ground: '#FFFFFF', flag: '#CE1126', centre: '#000000', empty: '#C6CACC' };

const COLOURS = DARK;

describe('buildMarkSvg', () => {
  it('declares the SVG namespace, without which a data URI icon will not render', () => {
    expect(buildMarkSvg(COLOURS)).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('keeps the design file\'s 64-unit viewBox', () => {
    expect(buildMarkSvg(COLOURS)).toContain('viewBox="0 0 64 64"');
  });

  it('paints every colour it was given', () => {
    const svg = buildMarkSvg(COLOURS);
    const { variant, ...colours } = COLOURS;
    expect(variant).toBe('dark');
    Object.values(colours).forEach((colour) => expect(svg).toContain(colour));
  });

  // Two flags on the diagonal, each with a centre — the warning signal. A
  // mark with one flag, or with the pair off-diagonal, is a different idea.
  it('draws two flags with two centres', () => {
    const svg = buildMarkSvg(COLOURS);
    expect(svg.split(`fill="${COLOURS.flag}"`).length - 1).toBe(2);
    expect(svg.split(`fill="${COLOURS.centre}"`).length - 1).toBe(2);
  });

  it('draws the two unmarked cells', () => {
    const svg = buildMarkSvg(COLOURS);
    expect(svg.split(`fill="${COLOURS.empty}"`).length - 1).toBe(2);
  });

  /*
    Order is load-bearing: SVG paints in document order, so a flag listed
    before the ground would be covered by it. The ground must come first and
    the centres must come after their flags.
  */
  it('paints the ground first and each centre after its flag', () => {
    const svg = buildMarkSvg(COLOURS);
    const ground = svg.indexOf(COLOURS.ground);
    const firstFlag = svg.indexOf(COLOURS.flag);
    const firstCentre = svg.indexOf(COLOURS.centre);
    expect(ground).toBeLessThan(firstFlag);
    expect(firstFlag).toBeLessThan(firstCentre);
  });

  it('puts the flags on the diagonal, not side by side', () => {
    const svg = buildMarkSvg(COLOURS);
    // Top-left at (5,5) and bottom-right at (34,34).
    expect(svg).toContain(`<rect x="5" y="5" width="25" height="25" rx="3.5" fill="${COLOURS.flag}"/>`);
    expect(svg).toContain(`<rect x="34" y="34" width="25" height="25" rx="3.5" fill="${COLOURS.flag}"/>`);
  });
});

describe('the outline cut', () => {
  it('strokes the unmarked cells instead of filling them', () => {
    const svg = buildMarkSvg(OUTLINE);
    expect(svg).toContain(`stroke="${OUTLINE.empty}"`);
    expect(svg).not.toContain(`fill="${OUTLINE.empty}"`);
    expect(svg.split('stroke-width=').length - 1).toBe(2);
  });

  /*
    A stroke is centred on its path, so the outlined cell has to be inset by
    half a stroke and shrunk by a whole one — otherwise it sits proud of the
    25-unit cell the filled variant occupies and the two cuts do not align.
  */
  it('insets the outline so it occupies the same 25-unit cell as a filled one', () => {
    const svg = buildMarkSvg(OUTLINE);
    expect(svg).toContain('x="35.25" y="6.25" width="22.5" height="22.5"');
    expect(svg).toContain('x="6.25" y="35.25" width="22.5" height="22.5"');
  });

  it('draws the same two flags as the dark cut', () => {
    const svg = buildMarkSvg(OUTLINE);
    expect(svg).toContain('<rect x="5" y="5" width="25" height="25" rx="3.5" fill="#CE1126"/>');
    expect(svg).toContain('<rect x="34" y="34" width="25" height="25" rx="3.5" fill="#CE1126"/>');
  });
});

describe('the dark cut', () => {
  it('fills the unmarked cells rather than stroking them', () => {
    const svg = buildMarkSvg(DARK);
    expect(svg).toContain(`fill="${DARK.empty}"`);
    expect(svg).not.toContain('stroke');
  });
});

describe('markDataUri', () => {
  it('produces an SVG data URI', () => {
    expect(markDataUri(COLOURS)).toMatch(/^data:image\/svg\+xml,/);
  });

  // `#` starts a fragment in a URL, so an unencoded colour truncates the
  // icon to a bare ground — which renders, silently, as a blank square.
  it('escapes the # in every colour', () => {
    const uri = markDataUri(COLOURS);
    expect(uri).not.toContain('#');
    expect(uri).toContain('%23');
  });

  it('round-trips back to the original markup', () => {
    const uri = markDataUri(COLOURS);
    const decoded = decodeURIComponent(uri.replace('data:image/svg+xml,', ''));
    expect(decoded).toBe(buildMarkSvg(COLOURS));
  });
});

describe('markColours', () => {
  it('covers every theme', () => {
    expect(Object.keys(markColours).sort()).toEqual(['dark', 'default', 'whalers']);
  });

  /*
    Whalers is the deliberate exception — an alternate-brand skin, where the
    green is the point and the nautical referent is the accepted cost.
    Everywhere else the mark stays the storm signal.
  */
  it('keeps the flag Canes red outside the Whalers skin', () => {
    expect(markColours.default.flag).toBe('#CE1126');
    expect(markColours.dark.flag).toBe('#CE1126');
    expect(markColours.whalers.flag).toBe('#046A38');
  });

  // Light and Whalers share 3b's white card; only Dark inverts the ground,
  // because that is the cut that survives a dark tab strip.
  it('uses the outline cut on light grounds and the dark cut on slate', () => {
    expect(markColours.default.variant).toBe('outline');
    expect(markColours.whalers.variant).toBe('outline');
    expect(markColours.dark.variant).toBe('dark');
    expect(markColours.dark.ground).toBe('#333F48');
  });

  // The two light themes have to be told apart by something.
  it('distinguishes Light from Whalers by the flag, not the ground', () => {
    expect(markColours.default.ground).toBe(markColours.whalers.ground);
    expect(markColours.default.flag).not.toBe(markColours.whalers.flag);
  });
});
