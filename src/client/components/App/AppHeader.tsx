import { Button, ConfigProvider, Flex } from 'antd';

import { useConfig, useDrawer, useGameBoard } from '@hooks';

import { SaveImage } from '@components/SaveImage';
import { headerButtonTheme } from '@app/themes.ts';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';

type AppHeaderProps = {
  themeName: string;
}

export default function AppHeader({ themeName }: Readonly<AppHeaderProps>) {
  const { headerText } = useConfig();
  const { open } = useDrawer();
  const { generateBoard } = useGameBoard();

  return (
    <Flex className="header" justify="space-between" align="center">
      <div className="header-title">
          <span className="full">{headerText}</span>
          <span className="short">Canes</span>
          <span className="end"> Bingo</span>
      </div>
      <Flex className="header-right" align="center">
        <ConfigProvider theme={headerButtonTheme[themeName]}>
          <Button
            className="generate"
            onClick={() => generateBoard()}
            icon={<ReloadOutlined />}
            title="Generate a new bingo card">
            Generate Card
          </Button>
        </ConfigProvider>
        <SaveImage />
        <Button
          type="primary"
          className="open-options"
          onClick={() => open()}
          icon={<SettingOutlined />}
          title="Open game options drawer">
          Options
        </Button>
      </Flex>
    </Flex>
  );
}
