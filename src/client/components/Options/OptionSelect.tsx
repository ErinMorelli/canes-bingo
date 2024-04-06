import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Divider, Form, Select, Typography } from 'antd';
import { LabeledValue } from 'antd/lib/select';

import { selectBoardArgs, updateBoardArg } from '@slices';
import { Category, MultiGroup } from '@app/types.ts';
import { useAppDispatch } from '@app/store.ts';
import { useGroups } from '@hooks';

type SelectOptionProps= {
  groupName: MultiGroup;
};

export default function OptionSelect({ groupName }: SelectOptionProps) {
  const dispatch = useAppDispatch();
  const { groups } = useGroups();

  const boardArgs = useSelector(selectBoardArgs);

  const selected = useMemo(
    () => boardArgs[groupName] || [],
    [boardArgs, groupName]
  );

  const group = useMemo(
    () => groups[groupName],
    [groupName, groups]
  );

  const values: Array<LabeledValue> = useMemo(
    () => {
      return selected.map((c: Category) => ({
        key: c.id.toString(),
        value: c.name,
        label: c.label
      }));
    },
    [selected]
  );

  const options = useMemo(
    () => !group
      ? []
      : [...group.categories]
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
        })),
    [group]
  );

  const isCategory = (item: Category | undefined): item is Category => !!item;

  const handleChange = useCallback((newValues: string[]) => {
    const newGroups = newValues
      .map((a) => group?.categories.find((b) => b.name === a))
      .filter(isCategory);
    dispatch(updateBoardArg({ groupName, value: newGroups }));
  }, [dispatch, group?.categories, groupName]);

  return !group ? null : (
    <>
      <Divider />
      <Form.Item
        tooltip={group.description || undefined}
        label={
          <Typography.Text strong>
            {group.label}
          </Typography.Text>
        }
      >
        <Select
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={values}
          style={{ width: 200 }}
          allowClear={true}
          onChange={handleChange}
          options={options}
          mode="multiple"
          size="large"
          maxTagCount="responsive"
          placeholder="Click to select..."
        />
     </Form.Item>
    </>
  )
}
