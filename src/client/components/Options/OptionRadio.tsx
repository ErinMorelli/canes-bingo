import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Form,
  Radio,
  RadioChangeEvent,
  Tooltip,
  Typography
} from 'antd';

import { selectBoardArgs, updateBoardArg } from '@slices';
import { useAppDispatch } from '@app/store.ts';
import { SingleGroup } from '@app/types.ts';
import { useGroups } from '@hooks';

type RadioOptionProps = {
  groupName: SingleGroup;
  hideMargin?: boolean;
}

export default function OptionRadio({ groupName, hideMargin }: RadioOptionProps) {
  const dispatch = useAppDispatch();
  const { groups } = useGroups();
  const boardArgs = useSelector(selectBoardArgs);

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
    dispatch(updateBoardArg({ groupName, value }));
  }, [dispatch, group, groupName]);

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
