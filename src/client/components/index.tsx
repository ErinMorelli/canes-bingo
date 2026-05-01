import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp } from 'antd';

import { queryClient } from '@app/queryClient';

import { ConfigProvider } from '@context/ConfigContext';
import { GameBoardProvider } from '@context/GameBoardContext';

type StoreGateProps = {
  readonly app: React.ReactNode;
}

export default function StoreGate({ app }: StoreGateProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <GameBoardProvider>
          <AntApp>{app}</AntApp>
        </GameBoardProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
