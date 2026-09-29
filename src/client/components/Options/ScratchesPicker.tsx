import { CSSProperties, useMemo, useState } from 'react';
import { Button, Drawer, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { BP_COMPACT } from '@app/constants';
import { sheetHandle } from '@app/themes';

import { useConfig, useMediaQuery, useScratches } from '@hooks';

type ScratchesPickerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * The roster: one searchable, grouped list of everyone who could be left off.
 *
 * Checkbox semantics rather than a segmented control or chips, because the
 * player is *choosing a set*, not switching between mutually exclusive
 * options — and with sixteen names the list has to be scannable and
 * searchable rather than laid out in a row.
 *
 * Stacked over the options drawer instead of replacing its contents, so
 * closing it returns to the options exactly as they were left.
 */
export function ScratchesPicker({ open, onClose }: Readonly<ScratchesPickerProps>) {
  const { rosters, isScratched, toggle, count } = useScratches();
  const { theme } = useConfig();

  // Same split as the options drawer itself: panel on desktop, sheet on
  // phones. `placement` is a prop, so the stylesheet cannot own this one.
  const isSheet = useMediaQuery(`(max-width: ${BP_COMPACT}px)`);

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rosters;
    return rosters
      .map((roster) => ({
        ...roster,
        categories: roster.categories.filter((c) =>
          c.label.toLowerCase().includes(needle)
        ),
      }))
      .filter((roster) => roster.categories.length > 0);
  }, [rosters, query]);

  const summary = count === 0
    ? 'Nobody scratched — every square is eligible.'
    : `${count} scratched — they won't appear on your next card.`;

  return (
    <Drawer
      rootClassName="scratches-picker"
      title={
        <div className="scratches-picker-title">
          <span>Scratches</span>
          <span className="scratches-picker-sub">Tick anyone not dressing tonight</span>
        </div>
      }
      placement={isSheet ? 'bottom' : 'right'}
      size={isSheet ? 'large' : 400}
      styles={{
        section: { '--sheet-handle': sheetHandle[theme.name] } as CSSProperties,
      }}
      open={open}
      // Done is the way out, as in the design — a ✕ beside it would be two
      // controls for one action in a header this narrow.
      closable={false}
      onClose={onClose}
      extra={<Button type="primary" size="small" onClick={onClose}>Done</Button>}
      footer={<div className="scratches-picker-footer">{summary}</div>}>
      <Input
        className="scratches-search"
        value={query}
        onChange={({ target }) => setQuery(target.value)}
        prefix={<SearchOutlined />}
        placeholder="Search players or crew"
        allowClear
        aria-label="Search players or crew"
      />

      {results.map((roster) => (
        <div className="scratch-group" key={roster.group}>
          <div className="scratch-group-label">{roster.label}</div>
          {roster.categories.map((category) => {
            const checked = isScratched(roster.group, category.name);
            return (
              /*
                A real <input type="checkbox">, visually hidden inside the
                label, rather than a button carrying role="checkbox". The
                role was the right *semantics* but the wrong mechanism: a
                native checkbox is announced and operated consistently
                everywhere, comes with its own keyboard handling, and the
                wrapping label makes the whole row the hit target for free.
                The square tick is still ours — the input is only hidden,
                never replaced.
              */
              <label
                key={category.name}
                className={`scratch-row${checked ? ' checked' : ''}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(roster.group, category)}
                />
                <span className="scratch-box" aria-hidden="true">
                  {checked ? '✓' : ''}
                </span>
                <span className="scratch-name">{category.label}</span>
              </label>
            );
          })}
        </div>
      ))}

      {results.length === 0 && (
        <p className="scratch-empty">No one matches that.</p>
      )}
    </Drawer>
  );
}
