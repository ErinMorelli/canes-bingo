import { useCallback } from 'react';
import { Button, Divider, Flex, Form } from 'antd';

import { useGameBoard } from '@hooks';

import { Group } from '@app/constants.ts';

import OptionRadio from './OptionRadio.tsx';
import OptionSelect from './OptionSelect.tsx';
import OtherOptions from './OtherOptions.tsx';

export function Options() {
  const { loadBoard } = useGameBoard();

  const radioOptions = Group.SingleGroups.map((groupName) => (
    <OptionRadio groupName={groupName} key={groupName} />
  ));

  const selectOptions = Group.MultiGroups.map((groupName) => (
    <OptionSelect groupName={groupName} key={groupName} />
  ));

  const handleReset = useCallback(() => loadBoard(true), [loadBoard]);

  return (
    <Form className="options" layout="vertical">
      {radioOptions}
      {selectOptions}
      <Divider />
      <OtherOptions />
      <Form.Item>
        <Flex justify="flex-end">
          <Button htmlType="button" onClick={() => handleReset()}>
            Reset
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
}
