import { useCallback, useMemo } from 'react';

import { Category, MultiGroup } from '@app/types';
import { Group } from '@app/constants';

import { useGameBoard } from './useGameBoard';
import { useGroups } from './useGroups';

/**
 * Scratches — who is left off tonight's card.
 *
 * There is no new plumbing behind this. `convertArgsToString` already folds
 * every multi-select group into the *exclude* list, so putting a player in
 * `boardArgs.players` has always meant "leave their squares out". The old
 * multi-select was doing exactly this without a name for it; the redesign
 * gives it one and a roster to pick from.
 *
 * Broadcast crew leads, as in the design: three names against thirteen, so
 * the short list is the one that fits above the fold.
 */
export const SCRATCH_GROUPS: readonly MultiGroup[] = [Group.BALLY, Group.PLAYERS];

/**
 * Section headings for the picker.
 *
 * Not the groups' own labels — those read "Hide Broadcaster Squares" and
 * "Hide Player Squares", which describe the old on/off control rather than
 * naming a roster. As headings above a list of people they would be telling
 * the player what the list does instead of who is in it.
 */
const SCRATCH_GROUP_LABELS: Record<MultiGroup, string> = {
  [Group.BALLY]: 'Broadcast crew',
  [Group.PLAYERS]: 'Players',
};

export type Scratch = {
  group: MultiGroup;
  category: Category;
};

export type ScratchRoster = {
  group: MultiGroup;
  label: string;
  categories: Category[];
};

function byLabel(a: Category, b: Category) {
  return a.label.localeCompare(b.label);
}

export function useScratches() {
  const { boardArgs, updateBoardArg } = useGameBoard();
  const { groups } = useGroups();

  /** Everyone currently scratched, in the order the picker lists them. */
  const scratched = useMemo<Scratch[]>(
    () =>
      SCRATCH_GROUPS.flatMap((group) =>
        (boardArgs[group] ?? []).map((category) => ({ group, category }))
      ),
    [boardArgs]
  );

  const isScratched = useCallback(
    (group: MultiGroup, name: string) =>
      (boardArgs[group] ?? []).some((c) => c.name === name),
    [boardArgs]
  );

  /**
   * Adds or removes one person. Goes through `updateBoardArg`, which also
   * marks the card stale — a scratch changes which squares are *eligible*, so
   * it cannot apply to a card already dealt.
   */
  const toggle = useCallback(
    (group: MultiGroup, category: Category) => {
      const current = boardArgs[group] ?? [];
      const next = current.some((c) => c.name === category.name)
        ? current.filter((c) => c.name !== category.name)
        : [...current, category];
      updateBoardArg({ groupName: group, value: next });
    },
    [boardArgs, updateBoardArg]
  );

  /** The pickable rosters, alphabetical within each — as the old select was. */
  const rosters = useMemo<ScratchRoster[]>(
    () =>
      SCRATCH_GROUPS.map((group) => ({
        group,
        label: SCRATCH_GROUP_LABELS[group],
        categories: [...(groups[group]?.categories ?? [])].sort(byLabel),
      })).filter((roster) => roster.categories.length > 0),
    [groups]
  );

  return { scratched, isScratched, toggle, rosters, count: scratched.length };
}
