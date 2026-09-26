import { useCallback, useMemo } from 'react';
import { Flex, Segmented } from 'antd';

import { SingleGroup } from '@app/types';

import { useGroups, useGameBoard } from '@hooks';

type RadioOptionProps = {
  groupName: SingleGroup;
}

export default function OptionRadio({ groupName }: RadioOptionProps) {
  const { groups } = useGroups();
  const { boardArgs, updateBoardArg } = useGameBoard();

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

  return !group || !selected ? null : (
    <Flex className="group-radio" orientation="vertical" gap={6}>
      <div className="group-title">{group.label}</div>
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
