import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Theme } from '@app/types';
import { ConfigKey, DEFAULT_FREE_SPACE, LOCAL_STORAGE_PREFIX } from '@app/constants';
import { themes, markColours } from '@app/themes';
import { markDataUri } from '@app/bingoMark';
import { parseScratchList } from '@app/utils';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { useLocalStorage } from '@hooks/useLocalStorage';

import { ConfigContext, ConfigContextValue } from './contexts';

const THEME_KEY = `${LOCAL_STORAGE_PREFIX}:theme`;
const TOOLTIPS_KEY = `${LOCAL_STORAGE_PREFIX}:tooltips`;

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

  /*
    Repaint the favicon and the browser's own UI colour to match the theme.

    Has to be JavaScript. `<link rel="icon" media="...">` is ignored by
    Chrome, and `prefers-color-scheme` only distinguishes light from dark —
    it has no way to say "Whalers". Only the app knows which theme is on.

    The mark is built as a data URI rather than served as files: every shape
    in it is a flat rect, so recolouring is a token swap and no asset has to
    exist on disk for a theme to have its own icon.
  */
  useEffect(() => {
    const colours = markColours[theme.name] ?? markColours.default;

    /*
      A dedicated SVG link, added alongside the PNGs rather than written over
      them.

      Rewriting the declared PNG links was the tidier-looking option and it
      stranded anyone whose browser cannot read an SVG icon — Safari before
      16.4 — with two links it has to ignore. It would have limped along on
      the undeclared /favicon.ico, which is to say by accident.

      This is the ordinary SVG-with-PNG-fallback arrangement: browsers that
      understand an SVG icon take it and follow the theme, the rest keep the
      PNG they were always going to use. Created here rather than declared in
      the HTML because its only content is the generated data URI.
    */
    const SVG_ICON = 'link[rel="icon"][type="image/svg+xml"]';
    let svgIcon = document.querySelector<HTMLLinkElement>(SVG_ICON);
    if (!svgIcon) {
      svgIcon = document.createElement('link');
      svgIcon.rel = 'icon';
      svgIcon.type = 'image/svg+xml';
      document.head.appendChild(svgIcon);
    }
    svgIcon.href = markDataUri(colours);

    /*
      Unlike the icon, this one reaches the browser chrome itself — the
      address bar on Chrome for Android and the status bar on iOS. The
      manifest carries a `theme_color` too, but that is read at install time
      and cannot follow a theme change, so this tag is the only part of it
      that can stay honest.

      Taken from the page ground rather than the icon's, which were the same
      value until the marks split: Light and Whalers now share a white card,
      so keying off the icon painted the address bar white for both and, on
      Dark, slate against a black page. `colorBgLayout` is the theme's own
      page ground, so the chrome tracks the shell rather than the icon.
    */
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const shell = theme.config?.token?.colorBgLayout;
    if (meta && typeof shell === 'string') meta.content = shell;
  }, [theme.name, theme.config]);

  const showTooltips = localTooltips === null ? true : localTooltips === 'true';

  const headerText = serverConfig[ConfigKey.HeaderText];
  // Trimmed before the fallback, so a value of whitespace counts as unset
  // rather than rendering a blank centre square.
  const freeSpace = serverConfig[ConfigKey.FreeSpace]?.trim() || DEFAULT_FREE_SPACE;
  const customClass = serverConfig[ConfigKey.CustomClass];
  const festiveLights =
    serverConfig[ConfigKey.FestiveLights]?.toLowerCase().trim() === 'on';

  /*
    Tonight's scratches, as published from the admin.

    Parsed here rather than where it is used so the raw string never leaves
    this provider, and memoised so the board's derived options do not see a
    new object on every render — the squares query is keyed on those.
  */
  const scratchList = useMemo(
    () => parseScratchList(serverConfig[ConfigKey.Scratches]),
    [serverConfig]
  );

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
      freeSpace,
      customClass,
      festiveLights,
      scratchList,
      isLoading,
    }),
    [theme, setLocalTheme, showTooltips, setTooltips, headerText, freeSpace, customClass, festiveLights, scratchList, isLoading]
  );

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

