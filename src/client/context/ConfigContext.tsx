import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Theme } from '@app/types';
import { ConfigKey, LOCAL_STORAGE_PREFIX } from '@app/constants';
import { themes } from '@app/themes';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { useLocalStorage } from '@hooks/useLocalStorage';

const THEME_KEY = `${LOCAL_STORAGE_PREFIX}:theme`;
const TOOLTIPS_KEY = `${LOCAL_STORAGE_PREFIX}:tooltips`;

type ConfigContextValue = {
  theme: Theme & { name: string };
  setTheme: (value: string) => void;
  showTooltips: boolean;
  setTooltips: (value: boolean) => void;
  headerText: string | undefined;
  customClass: string | undefined;
  festiveLights: boolean;
  isLoading: boolean;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: configItems = [], isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const result = await apiClient.provide(Api.config.list, {});
      return getData(result).items;
    },
    staleTime: 5 * 60 * 1000,
  });

  const serverConfig = useMemo(() => {
    const map: Partial<Record<ConfigKey, string>> = {};
    configItems.forEach((item) => {
      map[item.key as ConfigKey] = item.value;
    });
    return map;
  }, [configItems]);

  const [localTheme, setLocalTheme] = useLocalStorage<string | null>(THEME_KEY, null);
  const [localTooltips, setLocalTooltips] = useLocalStorage<string | null>(TOOLTIPS_KEY, null);

  const theme = useMemo<Theme & { name: string }>(() => {
    const name = localTheme ?? serverConfig[ConfigKey.Theme] ?? 'default';
    const resolved = themes[name] ? name : 'default';
    return { ...themes[resolved], name: resolved };
  }, [localTheme, serverConfig]);

  const showTooltips = localTooltips === null ? true : localTooltips === 'true';

  const headerText = serverConfig[ConfigKey.HeaderText];
  const customClass = serverConfig[ConfigKey.CustomClass];
  const festiveLights =
    serverConfig[ConfigKey.FestiveLights]?.toLowerCase().trim() === 'on';

  const setTooltips = useCallback(
    (v: boolean) => setLocalTooltips(String(v)),
    [setLocalTooltips]
  );

  const value = useMemo<ConfigContextValue>(
    () => ({
      theme,
      setTheme: setLocalTheme,
      showTooltips,
      setTooltips,
      headerText,
      customClass,
      festiveLights,
      isLoading,
    }),
    [theme, setLocalTheme, showTooltips, setTooltips, headerText, customClass, festiveLights, isLoading]
  );

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfigContext must be used within ConfigProvider');
  return ctx;
}
