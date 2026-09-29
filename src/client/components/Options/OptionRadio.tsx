import { useCallback, useMemo } from 'react';
import { Flex, Segmented } from 'antd';

import { SingleGroup } from '@app/types';

import { useGroups, useGameBoard } from '@hooks';

type RadioOptionProps = {
  groupName: SingleGroup;
}

export default function OptionRadio({ groupName }: RadioOptionProps) {
  const { groups } = useGroups();
  const { boardArgs, autoGroups, updateBoardArg } = useGameBoard();

  const group = useMemo(
    () => groups[groupName],
    [groupName, groups]
  );

  const selected = useMemo(
    () => {
      const category = boardArgs[groupName];
      return category ? category.name : undefined;
    },
    [boardArgs, groupName]
  );

  const handleChange = useCallback((val: string) => {
    const value = group!.categories.find((c) => c.name === val)!;
    updateBoardArg({ groupName, value });
  }, [group, groupName, updateBoardArg]);

  /*
    Says where the value came from, not what it is.

    Without it the detection is invisible: the control looks exactly as it
    would if someone had picked Away by hand, so a player has no way to tell
    a correct auto-answer from a stale setting they forgot to change — and no
    reason to trust either. It disappears the moment they choose, because
    from then on the answer is theirs and the label would be a lie.
  */
  const isAuto = autoGroups.has(groupName);

  return !group || !selected ? null : (
    <Flex className="group-radio" orientation="vertical" gap={6}>
      <Flex className="group-title-row" align="center" gap={8}>
        <div className="group-title">{group.label}</div>
        {isAuto && (
          <span className="group-auto" title="Set from tonight's game">Auto</span>
        )}
      </Flex>
      <Segmented<string>
        block
        options={group.categories.map((cat) => ({
          label: cat.label,
          value: cat.name,
          tooltip: {
            title: cat.description,
          },
        }))}
        value={selected}
        onChange={handleChange}
      />
    </Flex>
  )
}
