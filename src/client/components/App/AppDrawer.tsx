import { useCallback } from 'react';
import { Button, Drawer, Flex, Spin } from 'antd';

import { useDrawer, useGameBoard, useGroups } from '@hooks';

import { Options } from '@components/Options';
import { InfoCircleFilled } from '@ant-design/icons';

type AppDrawerProps = {
  customClass?: string;
}

export default function AppDrawer({ customClass = '' }: AppDrawerProps) {
  const { isOpen, close } = useDrawer();
  const { loadBoard, squaresError } = useGameBoard();
  const { isLoading: groupsLoading } = useGroups();

  const handleReset = useCallback(() => loadBoard(true), [loadBoard]);

  return (
    <Drawer
      title="Game Options"
      className={customClass}
      size={400}
      open={isOpen || squaresError}
      closable={{ placement: 'end' }}
      onClose={() => !squaresError && close()}
      footer={
        <Flex className="drawer-footer" orientation="vertical" gap={10}>
          <Flex className="drawer-footer-notice" align="center" gap={8}>
            <InfoCircleFilled />
            <div>These settings change which squares are eligible. Generate a new card to apply them.</div>
          </Flex>
          <Button className="drawer-footer-button" type="primary">
            Generate New Card
          </Button>
          <Flex className="drawer-footer-sub" align="center" justify="center">
            Esc or click the board to close
          </Flex>
        </Flex>
      }
      extra={
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      }>
      <Spin size="large" spinning={groupsLoading}>
        {!groupsLoading && <Options />}
      </Spin>
    </Drawer>
  )
}
