import { useCallback, useMemo } from 'react';
import { Form, Select, Switch, Typography } from 'antd';

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
  }, [showTooltips]);

  return (
    <>
      <Form.Item label={<Typography.Text strong>Theme</Typography.Text>}>
        <Select
          style={{ width: 200 }}
          size="large"
          defaultValue="default"
          value={selectedTheme}
          options={themeOptions}
          onChange={handleThemeChange}
        />
      </Form.Item>
      <Form.Item
        tooltip="Show or hide the square definition tooltips."
        label={
          <Typography.Text strong>Square Tooltips</Typography.Text>
        }>
        <Switch
          defaultChecked
          checkedChildren="On"
          unCheckedChildren="Off"
          checked={showTooltips}
          onChange={handleTooltipChange} />
      </Form.Item>
    </>
  )
}