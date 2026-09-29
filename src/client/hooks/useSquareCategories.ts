import { useMemo } from 'react';

import { Group } from '@app/constants';
import { Square, Squares } from '@app/types';

import { useGroups } from './useGroups';

export type SquareCategory = {
  id: number;
  /** Display name, e.g. "Local" or "Sebastian Aho #20". */
  label: string;
  /** Which filter group it belongs to. */
  group: string;
};

export type CategoryChip = {
  key: string;
  label: string;
  matches: (square: Square) => boolean;
};

/** Groups whose categories are listed one chip each. */
const ITEMISED_GROUPS: ReadonlySet<string> = new Set([Group.LOCATION, Group.BROADCAST]);

/** Groups collapsed to a single chip, because they hold a long tail. */
const COLLAPSED_GROUPS: ReadonlyArray<{ group: string; label: string }> = [
  { group: Group.PLAYERS, label: 'Players' },
  { group: Group.BALLY, label: 'Broadcasters' },
];

function parseIds(square: Square): number[] {
  return (square.categories ?? '')
    .split(',')
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));
}

/**
 * Resolves the category ids the API puts on each square into labelled
 * categories, and builds the filter chips for the squares database.
 *
 * Two things fall out of only reading the four filter groups:
 *
 * 1. `general` disappears. It is a category but belongs to none of the groups,
 *    so it never resolves — which is what we want, since two thirds of the
 *    pool carries it and "General" is not information.
 * 2. Empty chips never appear. `away` and `irl` exist as categories but no
 *    square currently uses them, and a chip that always returns nothing is
 *    worse than no chip.
 */
export function useSquareCategories(squares: Squares) {
  const { groups, isLoading } = useGroups();

  /** Category id -> label + owning group, for the four filter groups only. */
  const byId = useMemo(() => {
    const map = new Map<number, SquareCategory>();
    Object.entries(groups).forEach(([groupName, group]) => {
      (group?.categories ?? []).forEach((category) => {
        map.set(category.id, {
          id: category.id,
          label: category.label,
          group: groupName,
        });
      });
    });
    return map;
  }, [groups]);

  const categoriesFor = useMemo(
    () => (square: Square): SquareCategory[] =>
      parseIds(square)
        .map((id) => byId.get(id))
        .filter((category): category is SquareCategory => Boolean(category)),
    [byId]
  );

  const chips = useMemo<CategoryChip[]>(() => {
    const used = new Set<number>();
    const usedGroups = new Set<string>();
    squares.forEach((square) => {
      categoriesFor(square).forEach((category) => {
        used.add(category.id);
        usedGroups.add(category.group);
      });
    });

    const itemised = [...byId.values()]
      .filter((category) => ITEMISED_GROUPS.has(category.group) && used.has(category.id))
      .map<CategoryChip>((category) => ({
        key: `cat-${category.id}`,
        label: category.label,
        matches: (square) => categoriesFor(square).some((c) => c.id === category.id),
      }));

    const collapsed = COLLAPSED_GROUPS
      .filter(({ group }) => usedGroups.has(group))
      .map<CategoryChip>(({ group, label }) => ({
        key: `group-${group}`,
        label,
        matches: (square) => categoriesFor(square).some((c) => c.group === group),
      }));

    return [
      { key: 'all', label: 'All', matches: () => true },
      ...itemised,
      ...collapsed,
    ];
  }, [squares, byId, categoriesFor]);

  return { chips, categoriesFor, isLoading };
}
