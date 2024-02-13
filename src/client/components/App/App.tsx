import { useEffect, useState } from 'react';
import { ConfigProvider, Spin, ThemeConfig } from 'antd';

import { themes } from '@app/themes.ts';
import { ConfigKey } from '@app/constants.ts';
import { fetchConfigValue } from '@app/utils.ts';

import { AppLayout } from './AppLayout.tsx';

export function App() {
  const [theme, setTheme] = useState<ThemeConfig>();

  useEffect(() => {
    fetchConfigValue(ConfigKey.Theme).then((themeName) => {
      const _theme = themeName in themes ? themes[themeName] : themes.default;
      setTheme(_theme);
    });
  }, []);

  return theme ? (
    <ConfigProvider theme={theme}>
      <AppLayout />
    </ConfigProvider>
  ) : (
    <Spin fullscreen />
  );
}