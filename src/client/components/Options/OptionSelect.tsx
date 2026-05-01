import { useCallback, useMemo } from 'react';
import { Form, Select, Typography } from 'antd';

import { Category, MultiGroup } from '@app/types';

import { useGroups, useGameBoard } from '@hooks';

type SelectOptionProps= {
  groupName: MultiGroup;
  hideMargin?: boolean
};

export default function OptionSelect({ groupName, hideMargin }: SelectOptionProps) {
  const { groups } = useGroups();
  const { boardArgs, updateBoardArg } = useGameBoard();

  const selected = useMemo(
    () => boardArgs[groupName] || [],
    [boardArgs, groupName]
  );

  const group = useMemo(
    () => groups[groupName],
    [groupName, groups]
  );

  const values = useMemo(
    () => selected.map((c: Category) => c.name),
    [selected]
  );

  const options = useMemo(
    () => group
      ? [...group.categories]
        .sort((a: Category, b: Category) => {
          if (a.label.toUpperCase() < b.label.toUpperCase()) {
            return -1;
          }
          if (a.label.toUpperCase() > b.label.toUpperCase()) {
            return 1;
          }
          return 0;
        })
        .map((cat) => ({
          value: cat.name,
          label: cat.label
        }))
      : [],
    [group]
  );

  const isCategory = (item: Category | undefined): item is Category => !!item;

  const handleChange = useCallback((newValues: string[]) => {
    const newGroups = newValues
      .map((a) => group?.categories.find((b) => b.name === a))
      .filter(isCategory);
    updateBoardArg({ groupName, value: newGroups });
  }, [group?.categories, groupName, updateBoardArg]);

  return group ? (
    <Form.Item
      tooltip={group.description || undefined}
      style={hideMargin ? { marginBottom: 0 } : undefined}
      label={
        <Typography.Text strong id={`group-${String(group.id)}`}>
          {group.label}
        </Typography.Text>
      }
    >
      <Select
        value={values}
        allowClear={true}
        onChange={handleChange}
        options={options}
        mode="multiple"
        size="middle"
        maxTagCount="responsive"
        placeholder="Click to select..."
        aria-labelledby={`group-${String(group.id)}`}
      />
   </Form.Item>
  ) : null;
}
