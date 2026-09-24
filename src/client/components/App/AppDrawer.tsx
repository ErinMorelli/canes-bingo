import { useCallback } from 'react';
import { Button, Drawer, Spin } from 'antd';

import { useDrawer, useGameBoard, useGroups } from '@hooks';

import { Options } from '@components/Options';

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
      size={300}
      open={isOpen || squaresError}
      onClose={() => !squaresError && close()}
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
