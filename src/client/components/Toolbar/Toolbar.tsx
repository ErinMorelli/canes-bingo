import { RefObject, useCallback, useState } from 'react';
import { ReloadOutlined, ToolFilled } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  CheckboxChangeEvent,
  Drawer,
  Flex,
  Popover,
  Spin,
} from 'antd';

import { useGameBoard, useGroups } from '@hooks';

import { StorageKey } from '@app/constants';
import { initStorageValue, setStorageValue } from '@app/utils';

import { Options } from '@components/Options';

import { ToolbarSaveImage } from './ToolbarSaveImage';

type ToolbarProps = {
  cardRef: RefObject<HTMLDivElement>;
  customClass?: string;
}

export function Toolbar({
  cardRef,
  customClass = '',
}: Readonly<ToolbarProps>) {
  const { loadBoard, generateBoard, squaresError } = useGameBoard();
  const { isLoading: groupsLoading } = useGroups();

  const getTourSeen = initStorageValue<boolean>(
    StorageKey.TourSeen,
    false
  );

  const getDefaultDrawerOpen = initStorageValue<boolean>(
    StorageKey.ShowOptionsOnLoad,
    true
  );

  const [tourSeen, setTourSeen] = useState(getTourSeen);

  const [defaultDrawerOpen, setDefaultDrawerOpen] = useState(getDefaultDrawerOpen);
  const [drawerOpen, setDrawerOpen] = useState(defaultDrawerOpen);

  const handleDrawerOpenChange = useCallback(({ target }: CheckboxChangeEvent) => {
    setDefaultDrawerOpen(!target.checked);
    setStorageValue(StorageKey.ShowOptionsOnLoad, !target.checked);
  }, [setDefaultDrawerOpen]);

  const handleTourSeenChange = useCallback(() => {
    setTourSeen(true);
    setStorageValue(StorageKey.TourSeen, true);
  }, [setTourSeen]);

  const handleReload = useCallback(() => generateBoard(), [generateBoard]);
  const handleReset = useCallback(() => loadBoard(true), [loadBoard]);

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
      <Drawer
        title="Game Options"
        className={customClass}
        size={300}
        open={drawerOpen || squaresError}
        onClose={() => !squaresError && setDrawerOpen(false)}
        extra={
          <Button size="small" onClick={handleReset}>
            Reset
          </Button>
        }
        footer={
          <Popover
            open={!tourSeen}
            trigger="click"
            placement="leftBottom"
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
                    onClick={handleTourSeenChange}
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
        <Spin size="large" spinning={groupsLoading}>
          {!groupsLoading && <Options />}
        </Spin>
      </Drawer>
    </div>
  )
}
