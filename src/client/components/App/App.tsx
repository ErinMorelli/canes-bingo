import { ConfigProvider, Spin } from 'antd';

import { useConfig } from '@hooks';

import { AppLayout } from './AppLayout.tsx';

export function App() {
  const { theme } = useConfig();

  return theme ? (
    <ConfigProvider theme={theme.config}>
      <AppLayout themeClass={theme.customClass} />
    </ConfigProvider>
  ) : (
    <Spin fullscreen />
  );
}