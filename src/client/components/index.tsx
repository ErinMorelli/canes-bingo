import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp } from 'antd';

import { queryClient } from '@app/queryClient';

import { ConfigProvider } from '@context/ConfigContext';
import { GameBoardProvider } from '@context/GameBoardContext';
import { SubmitProvider } from '@context/SubmitContext';

type StoreGateProps = {
  readonly app: React.ReactNode;
}

export default function StoreGate({ app }: StoreGateProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <GameBoardProvider>
          {/* antd's App renders a wrapper div; it needs a class so the
              full-height chain does not break here. */}
          {/* Only the open/close state lives up here. The modal itself is
              rendered by each page, inside that page's themed ConfigProvider —
              mounted here it sits outside the theme's CSS-var scope and comes
              out in antd's default blue. */}
          <SubmitProvider>
            <AntApp className="app-root">{app}</AntApp>
          </SubmitProvider>
        </GameBoardProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
