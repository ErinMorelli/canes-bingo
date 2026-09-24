import { RefObject } from 'react';
import { Button, ConfigProvider, Flex } from 'antd';

import { useConfig, useDrawer, useGameBoard } from '@hooks';

import { SaveImage } from '@components/SaveImage';
import { headerButtonTheme } from '@app/themes.ts';

type AppHeaderProps = {
  cardRef: RefObject<HTMLDivElement>;
  themeName: string;
}

export default function AppHeader({ cardRef, themeName }: Readonly<AppHeaderProps>) {
  const { headerText } = useConfig();
  const { open } = useDrawer();
  const { generateBoard } = useGameBoard();

  return (
    <Flex className="header" justify="space-between" align="center">
      <div className="header-title">{headerText} <span>Bingo</span></div>
      <Flex className="header-right" align="center" gap={8}>
        <ConfigProvider theme={headerButtonTheme[themeName]}>
          <Button
            className="generate"
            onClick={() => generateBoard()}
            title="Generate a new bingo card">
            Generate Card
          </Button>
        </ConfigProvider>
        <SaveImage cardRef={cardRef} />
        <Button
          type="primary"
          onClick={() => open()}
          title="Open game options drawer">
          Options
        </Button>
      </Flex>
    </Flex>
  );
}
