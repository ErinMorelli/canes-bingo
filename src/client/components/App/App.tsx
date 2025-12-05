import { useEffect } from 'react';
import { ConfigProvider, Spin } from 'antd';

import { useConfig } from '@hooks';

import { AppLayout } from './AppLayout.tsx';

export function App() {
  const { theme } = useConfig();

  useEffect(() => {
    document.body.style.backgroundColor =
      theme?.config?.components?.Layout?.footerBg || 'inherit';
  }, [theme]);

  return theme ? (
    <ConfigProvider theme={theme.config}>
      <AppLayout themeClass={theme.customClass} themeName={theme.name} />
    </ConfigProvider>
  ) : (
    <Spin fullscreen />
  );
}