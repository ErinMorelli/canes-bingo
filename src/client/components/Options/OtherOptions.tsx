import React, { useCallback, useMemo } from 'react';
import { Flex, Segmented, Switch } from 'antd';
import { MoonFilled, SunFilled } from '@ant-design/icons';

import { themes } from '@app/themes';

import { useConfig } from '@hooks';

const WhalersIcon: React.FC = () => (
  <svg  width="1em" height="1em" viewBox="0 0 144.167 142.879">
    <path fill="currentColor" d="M4.167,0.342c0,0,11.667,10.569,20.333,9.578h17.333c0,0,26.333-0.33,30.333,12.88 c0,0,5.666-12.549,24.333-12.88h22c0,0,8.333,1.321,21-9.907c0,0,4.333-0.991,4,14.861c0,0,4,25.429-40.333,36.988 c0,0-16.667,4.955-16,16.513v10.567H56.833V68.704c0,0-1-14.201-20.333-17.503c0,0-39.333-10.568-36.333-38.97 C0.167,12.231,0.167-2.3,4.167,0.342z"/>
    <path fill="currentColor" d="M143,39.808c-5.166,5.615-19,12.55-19,12.55c-7.666,3.138-9.834,9.411-9.834,9.411v51.52h-28V88.354h-29 v25.1H29.5V64.081c0,0,0.333-6.439-10.833-12.384C7.5,45.752,1.333,39.641,0.5,39.807L0,110.647c0,0,5.667,32.363,38.333,32.198 c0,0,20.5,1.652,33.333-18.163c0,0,8.834,17.668,33.167,18.163c0,0,29.5,0.332,39.333-30.052"/>
  </svg>
);

const themeIcons: Record<string, React.ReactNode> = {
  default: <SunFilled />,
  dark: <MoonFilled />,
  whalers: <WhalersIcon />,
};

export default function OtherOptions() {
  const { theme, showTooltips, setTheme, setTooltips } = useConfig();

  const selectedTheme = useMemo(() => theme.name, [theme]);

  const themeOptions = Object.keys(themes)
    .sort((a, b) => a.localeCompare(b))
    .map((themeName) => ({
      value: themeName,
      label: themes[themeName].label,
      icon: themeIcons[themeName],
    }));

  const handleThemeChange = useCallback((newValue: string) => {
    setTheme(newValue)
  }, [setTheme]);

  const handleTooltipChange = useCallback((checked: boolean) => {
    setTooltips(checked);
  }, [setTooltips]);

  return (
    <>
      <Flex orientation="vertical" gap={6}>
        <div className="group-title">Theme</div>
        <Segmented<string>
          block
          options={themeOptions}
          value={selectedTheme}
          onChange={handleThemeChange}
        />
      </Flex>
      <Flex align="center" justify="space-between">
        <Flex orientation="vertical">
          <div className="tooltip-title" id="square-tooltips-label">Square Tooltips</div>
          <div className="tooltip-sub">Show or hide the square tooltips</div>
        </Flex>
        {/* Named from the visible heading — see the note in GameOption. */}
        <Switch
          checked={showTooltips}
          onChange={handleTooltipChange}
          aria-labelledby="square-tooltips-label" />
      </Flex>
    </>
  )
}