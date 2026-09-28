// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Category, MultiGroup } from '@app/types';

const toggle = vi.fn();

const PLAYERS = 'players' as MultiGroup;
const BALLY = 'bally' as MultiGroup;

const cat = (name: string, label: string): Category =>
  ({ id: name, name, label, description: null }) as unknown as Category;

const ROSTERS = [
  { group: BALLY, label: 'Broadcast crew', categories: [cat('tripp', 'Tripp Tracy')] },
  {
    group: PLAYERS,
    label: 'Players',
    categories: [cat('aho', 'Sebastian Aho #20'), cat('svech', 'Andrei Svechnikov #37')],
  },
];

/** Names currently ticked; each test sets this before rendering. */
let scratched = new Set<string>();

vi.mock('@hooks', () => ({
  useConfig: () => ({ theme: { name: 'default', config: {} } }),
  useMediaQuery: () => false,
  useScratches: () => ({
    rosters: ROSTERS,
    isScratched: (_g: MultiGroup, name: string) => scratched.has(name),
    toggle,
    count: scratched.size,
  }),
}));

import { ScratchesPicker } from './ScratchesPicker';

/**
 * These cover the swap from `<button role="checkbox">` to a real
 * `<input type="checkbox">` inside a `<label>`. The point of that change was
 * that the native control brings its own semantics and activation behaviour,
 * so the tests assert exactly those: that it *is* a checkbox to the
 * accessibility tree, and that the label forwards a click on the row.
 */
describe('ScratchesPicker', () => {
  beforeEach(() => {
    /*
      Explicit, because Testing Library only registers its automatic cleanup
      when the test framework exposes globals — and this project runs Vitest
      without `globals: true`. Without it each render is left in the document
      and the next test sees every previous one too.
    */
    cleanup();
    toggle.mockClear();
    scratched = new Set();
  });

  it('exposes each person as a real checkbox named after them', () => {
    render(<ScratchesPicker open onClose={vi.fn()} />);

    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(3);
    // The accessible name comes from the wrapping label's text, so this also
    // proves the input and the visible name are actually associated.
    expect(screen.getByRole('checkbox', { name: 'Tripp Tracy' })).toBeDefined();
    expect(screen.getByRole('checkbox', { name: 'Sebastian Aho #20' })).toBeDefined();
  });

  /*
    The structural half of the Sonar fix (typescript:S6819). A button carrying
    role="checkbox" satisfies every behavioural assertion in this file — it
    clicks, it takes the space key, it reports the right role and name — so
    without this the swap could be reverted and only one test would notice.
    What the native control actually buys is the element itself.
  */
  it('uses a native input inside a label, not a button with a role', () => {
    render(<ScratchesPicker open onClose={vi.fn()} />);

    for (const box of screen.getAllByRole('checkbox')) {
      expect(box.tagName).toBe('INPUT');
      expect((box as HTMLInputElement).type).toBe('checkbox');
      // No hand-written state attribute: the element carries it natively.
      expect(box.getAttribute('aria-checked')).toBeNull();
      expect(box.closest('label')).not.toBeNull();
    }
  });

  it('reflects who is already scratched', () => {
    scratched = new Set(['svech']);
    render(<ScratchesPicker open onClose={vi.fn()} />);

    expect((screen.getByRole('checkbox', { name: 'Andrei Svechnikov #37' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: 'Tripp Tracy' }) as HTMLInputElement).checked).toBe(false);
  });

  it('toggles when the row\'s name is clicked, not just the box', async () => {
    const user = userEvent.setup();
    render(<ScratchesPicker open onClose={vi.fn()} />);

    // Clicking the *text* is the case the <label> exists for — the old
    // button handled this itself, so it is the behaviour most at risk in
    // the swap.
    await user.click(screen.getByText('Sebastian Aho #20'));

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(toggle.mock.calls[0][0]).toBe(PLAYERS);
    expect(toggle.mock.calls[0][1]).toMatchObject({ name: 'aho' });
  });

  it('toggles from the keyboard, which the native control brings for free', async () => {
    const user = userEvent.setup();
    render(<ScratchesPicker open onClose={vi.fn()} />);

    const box = screen.getByRole('checkbox', { name: 'Tripp Tracy' });
    box.focus();
    expect(document.activeElement).toBe(box);

    await user.keyboard(' ');
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(toggle.mock.calls[0][1]).toMatchObject({ name: 'tripp' });
  });

  it('groups the rosters under their own headings', () => {
    render(<ScratchesPicker open onClose={vi.fn()} />);

    const groups = document.querySelectorAll('.scratch-group');
    expect(groups).toHaveLength(2);
    expect(within(groups[0] as HTMLElement).getByText('Broadcast crew')).toBeDefined();
    expect(within(groups[1] as HTMLElement).getByText('Players')).toBeDefined();
  });

  it('narrows to matching people as you search', async () => {
    const user = userEvent.setup();
    render(<ScratchesPicker open onClose={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'aho');

    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getByRole('checkbox', { name: 'Sebastian Aho #20' })).toBeDefined();
    // The now-empty roster goes with it rather than leaving a bare heading.
    expect(screen.queryByText('Broadcast crew')).toBeNull();
  });

  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    render(<ScratchesPicker open onClose={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'zzzz');

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.getByText('No one matches that.')).toBeDefined();
  });
});
