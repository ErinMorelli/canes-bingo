import { useCallback, useMemo } from 'react';
import {
  Form,
  Radio,
  RadioChangeEvent,
  Tooltip,
  Typography
} from 'antd';

import { SingleGroup } from '@app/types';

import { useGroups, useGameBoard } from '@hooks';

type RadioOptionProps = {
  groupName: SingleGroup;
  hideMargin?: boolean;
}

export default function OptionRadio({ groupName, hideMargin }: RadioOptionProps) {
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

  const handleChange = useCallback(({ target }: RadioChangeEvent) => {
    const value = group!.categories.find((c) => c.name === target.value)!;
    updateBoardArg({ groupName, value });
  }, [group, groupName, updateBoardArg]);

  return !group || !selected ? null : (
    <Form.Item
      style={hideMargin ? { marginBottom: 0 } : undefined}
      label={
        <Typography.Text strong>
          {group.label}
        </Typography.Text>
      }
    >
      <Radio.Group
        onChange={handleChange}
        value={selected}
        size="middle"
        buttonStyle="solid"
        optionType="button"
      >
        {group.categories.map((cat) => cat.description ? (
          <Tooltip title={cat.description} key={cat.id}>
            <Radio.Button value={cat.name} title={cat.description}>
              {cat.label}
            </Radio.Button>
          </Tooltip>
        ) : (
          <Radio.Button value={cat.name} key={cat.id}>
            {cat.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
  )
}
