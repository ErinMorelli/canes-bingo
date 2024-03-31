import { RefObject, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReloadOutlined, ToolFilled } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Drawer,
  Flex,
  Popover,
  Spin,
} from 'antd';
import type { CheckboxProps } from 'antd';

import { selectBoardArgs } from '@slices';
import { StorageKey } from '@app/constants.ts';
import { useGroups, useSquares } from '@hooks';
import { initStorageValue, setStorageValue } from '@app/utils.ts';

import { Options } from '../Options';
import { ToolbarSaveImage } from './ToolbarSaveImage.tsx';

type ToolbarProps = {
  cardRef: RefObject<HTMLDivElement>;
}

export function Toolbar({ cardRef }: Readonly<ToolbarProps>) {
  const { generateBoard, squaresError } = useSquares();
  const { groupsLoaded } = useGroups();

  const boardArgs = useSelector(selectBoardArgs);

  const getTourSeen = () => initStorageValue<boolean>(
    StorageKey.TourSeen,
    false
  );

  const getDefaultDrawerOpen = () => initStorageValue<boolean>(
    StorageKey.ShowOptionsOnLoad,
    true
  );

  const [tourSeen, setTourSeen] = useState(getTourSeen());

  const [defaultDrawerOpen, setDefaultDrawerOpen] = useState(getDefaultDrawerOpen());
  const [drawerOpen, setDrawerOpen] = useState(defaultDrawerOpen);

  const handleDrawerOpenChange: CheckboxProps['onChange'] = ({ target }) => {
    setDefaultDrawerOpen(target.checked);
    setStorageValue(StorageKey.ShowOptionsOnLoad, target.checked);
  }

  const handleTourSeenChange = () => {
    setTourSeen(true);
    setStorageValue(StorageKey.TourSeen, true);
  }

  const handleReload = useCallback(
  () => generateBoard(boardArgs),
  [boardArgs, generateBoard]
  );

  return (
    <div className="toolbar">
      <Flex justify="space-between">
        {/* LEFT */}
        <Button
          onClick={handleReload}
          type="primary"
          title="Generate a new bingo card"
          icon={<ReloadOutlined />}
        >Generate Card</Button>
        {/* RIGHT */}
        <Flex gap={5}>
          <Button
            onClick={() => setDrawerOpen(true)}
            title="Open game options drawer"
            icon={<ToolFilled />}
          >
            Game Options
          </Button>
          <ToolbarSaveImage cardRef={cardRef} />
        </Flex>
      </Flex>
      {
      <Drawer
        title="Game Options"
        width={300}
        open={drawerOpen || squaresError}
        onClose={() => !squaresError && setDrawerOpen(false)}
        footer={
          <Popover
            open={!tourSeen}
            trigger="click"
            placement="leftBottom"
            title={<h3 style={{ color: "#C81025" }}>NEW!</h3>}
            content={
              <div style={{ maxWidth: '250px' }}>
                <p style={{ marginBottom: '10px' }}>
                  The game options drawer will always open when you visit the
                  site, but you can change that here.
                </p>
                <p style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleTourSeenChange()}
                  >
                    OK
                  </Button>
                </p>
              </div>
            }
          >
            <Checkbox
              checked={defaultDrawerOpen}
              onChange={handleDrawerOpenChange}
            >
              Always open on page load
            </Checkbox>
          </Popover>
        }
      >
        <Spin size="large" spinning={!groupsLoaded}>
          {groupsLoaded && <Options />}
        </Spin>
      </Drawer>
      }
    </div>
  )
}