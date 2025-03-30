import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '@app/store.ts';
import { Theme } from '@app/types.ts';
import { ConfigKey } from '@app/constants.ts';
import { themes } from '@app/themes.ts';

import { fetchConfigValue, selectConfig, updateConfigValue } from '@slices';

type UseConfigResult = {
  theme: Theme & { name: string };
  setTheme: (value: string) => void;
  showTooltips: boolean;
  setTooltips: (value: boolean) => void;
};

export function useConfig(): UseConfigResult {
  const dispatch = useAppDispatch();

  const config = useSelector(selectConfig);

  const theme = useMemo(() => {
    const name = config[ConfigKey.Theme];
    return { ...themes[name], name };
  }, [config]);

  const showTooltips = useMemo(() => {
    const value = config[ConfigKey.Tooltips];
    return value ? value === 'true' : true;
  }, [config]);

  const setConfigValue = useCallback(
    (key: ConfigKey, value: string) => {
      dispatch(updateConfigValue({ key, value }));
    },
    [dispatch]
  );

  const loadConfigValue = useCallback((key: ConfigKey) => {
    if (!config[key]) {
      dispatch(fetchConfigValue(key));
    }
  }, [config, dispatch]);

  useEffect(() => {
    loadConfigValue(ConfigKey.Theme);
  }, [loadConfigValue]);

  return {
    theme,
    showTooltips,
    setTheme: (value: string) => setConfigValue(ConfigKey.Theme, value),
    setTooltips: (value: boolean) => setConfigValue(ConfigKey.Tooltips, String(value)),
  };
}