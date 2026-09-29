import { useState } from 'react';
import { Flex } from 'antd';

import { useScratches } from '@hooks';

import { ScratchesPicker } from './ScratchesPicker';

/**
 * The scratches summary inside Game Options: who is being left off, with a
 * way to change it.
 *
 * Each name is its own chip and its own remove button, so undoing one
 * scratch does not mean reopening the roster to find it. The roster is for
 * adding; the chips are for taking back.
 */
export function Scratches() {
  const { scratched, toggle, count } = useScratches();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Flex className="scratches" orientation="vertical" gap={10}>
      <Flex align="baseline" justify="space-between" gap={8}>
        <div className="group-title">Scratches</div>
        <div className="scratches-hint">Left off tonight&apos;s card</div>
      </Flex>

      <Flex className="scratches-chips" align="center" gap={6} wrap>
        {count === 0 && <span className="scratches-empty">Everyone&apos;s in</span>}

        {scratched.map(({ group, category }) => (
          <button
            type="button"
            key={`${group}-${category.name}`}
            className="scratch-chip"
            aria-label={`Remove ${category.label} from scratches`}
            onClick={() => toggle(group, category)}>
            {category.label}
            <span aria-hidden="true">&#10005;</span>
          </button>
        ))}

        <button
          type="button"
          className="scratch-add"
          onClick={() => setPickerOpen(true)}>
          + Add
        </button>
      </Flex>

      <ScratchesPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </Flex>
  );
}
