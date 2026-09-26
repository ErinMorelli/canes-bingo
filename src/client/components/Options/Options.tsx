import { Flex, Form } from 'antd';

import { Group } from '@app/constants.ts';

import GameOption from './GameOption';
import OptionRadio from './OptionRadio';
// import OptionSelect from './OptionSelect';
import OtherOptions from './OtherOptions';

export function Options() {
  const radioOptions = Group.SingleGroups.map((groupName, idx) => (
    <OptionRadio groupName={groupName} key={groupName} />
  ));

  // const selectOptions = Group.MultiGroups.map((groupName, idx) => (
  //   <OptionSelect
  //     groupName={groupName}
  //     key={groupName}
  //     hideMargin={Group.MultiGroups.length - 1 === idx}
  //   />
  // ));

  return (
    <Form className="options" layout="vertical">
      <Flex className="options-header" align="center">
        <span>This Game</span>
      </Flex>
      {/* Location & Broadcast */}
      {radioOptions}
      {/* Scratches */}
      {/* Game Pattern */}
      <GameOption />
      <Flex className="options-header" align="center">
        <span>Preferences</span>
      </Flex>
      {/* Theme & Tooltips */}
      <OtherOptions />
    </Form>
  );
}
