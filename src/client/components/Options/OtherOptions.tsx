import { useCallback, useMemo } from 'react';
import { Flex, Form, Select, Switch, Typography } from 'antd';

import { themes } from '@app/themes.ts';

import { useConfig } from '@hooks';

export default function OtherOptions() {
  const { theme, showTooltips, setTheme, setTooltips } = useConfig();

  const selectedTheme = useMemo(() => theme.name, [theme]);

  const themeOptions = Object.keys(themes)
    .sort((a, b) => a.localeCompare(b))
    .map((themeName) => ({
      value: themeName,
      label: themes[themeName].label,
    }));

  const handleThemeChange = useCallback((newValue: string) => {
    setTheme(newValue)
  }, [setTheme]);

  const handleTooltipChange = useCallback((checked: boolean) => {
    setTooltips(checked);
  }, [setTooltips]);

  return (
    <Flex orientation="vertical" gap="20px">
      <Form.Item
        label={<Typography.Text strong>Theme</Typography.Text>}
        style={{ marginBottom: 0 }}
      >
        <Select
          defaultValue="default"
          size="middle"
          value={selectedTheme}
          options={themeOptions}
          onChange={handleThemeChange}
        />
      </Form.Item>
      <Form.Item
        className="inline-switch-form"
        layout="horizontal"
        colon={false}
        tooltip="Show or hide the square definition tooltips."
        label={<Typography.Text strong>Square Tooltips</Typography.Text>}
        style={{ marginBottom: 0 }}
      >
        <Switch
          defaultChecked
          checkedChildren="On"
          unCheckedChildren="Off"
          checked={showTooltips}
          onChange={handleTooltipChange} />
      </Form.Item>
    </Flex>
  )
}