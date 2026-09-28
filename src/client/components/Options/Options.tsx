import { Flex } from 'antd';

import { Group } from '@app/constants';

import GameOption from './GameOption';
import OptionRadio from './OptionRadio';
import OtherOptions from './OtherOptions';
import { Scratches } from './Scratches';

export function Options() {
  const radioOptions = Group.SingleGroups.map((groupName) => (
    <OptionRadio groupName={groupName} key={groupName} />
  ));

  // No `gap` prop: the spacing differs between the panel and the sheet, and an
  // inline style cannot carry a breakpoint. It is set on `.options` instead.
  return (
    <Flex className="options" orientation="vertical">
      <Flex className="options-header" align="center">
        <span>This Game</span>
      </Flex>
      {/* Location & Broadcast */}
      {radioOptions}
      <Scratches />
      {/* Game Pattern */}
      <GameOption />
      <Flex className="options-header" align="center">
        <span>Preferences</span>
      </Flex>
      {/* Theme & Tooltips */}
      <OtherOptions />
    </Flex>
  );
}
