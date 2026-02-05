import { Divider, Form, Space } from 'antd';

import { Group } from '@app/constants.ts';

import GameOption from './GameOption.tsx';
import OptionRadio from './OptionRadio.tsx';
import OptionSelect from './OptionSelect.tsx';
import OtherOptions from './OtherOptions.tsx';

export function Options() {
  const radioOptions = Group.SingleGroups.map((groupName, idx) => (
    <OptionRadio
      groupName={groupName}
      key={groupName}
      hideMargin={Group.SingleGroups.length - 1 === idx}
    />
  ));

  const selectOptions = Group.MultiGroups.map((groupName, idx) => (
    <OptionSelect
      groupName={groupName}
      key={groupName}
      hideMargin={Group.MultiGroups.length - 1 === idx}
    />
  ));

  return (
    <Form className="options" layout="vertical">
      <Space
        style={{ width: '100%' }}
        orientation="vertical"
        size="small"
        separator={<Divider size="middle" />}
      >
        <div>{radioOptions}</div>
        <div>{selectOptions}</div>
        <OtherOptions />
        <GameOption />
      </Space>
    </Form>
  );
}
