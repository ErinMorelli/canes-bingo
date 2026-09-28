import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, notification, Spin, Typography } from 'antd';

import { useConfig, useGameBoard, useGroups } from '@hooks';

import { Card } from '@components/Card';
import { SubmitSquare } from '@components/Submit';
import { Status } from '@components/Status';
import { WinBar } from '@components/Win';

import { DrawerProvider } from '@context/DrawerContext';
import { ShareProvider } from '@context/ShareContext';

import AppDrawer from './AppDrawer';
import AppFooter from './AppFooter';
import AppHeader from './AppHeader';
import AppLights from './AppLights';

const { Header, Content, Footer } = Layout

const notificationKey = 'squaresError';

type AppLayoutProps = {
  readonly themeClass?: string;
  readonly themeName: string;
}

export function AppLayout({ themeClass, themeName }: AppLayoutProps) {
  const [api, contextHolder] = notification.useNotification({
    placement: 'top',
    maxCount: 1,
  });

  const { isLoading: groupsLoading } = useGroups();
  const { boardReady, squaresError } = useGameBoard();
  const { customClass: serverCustomClass, festiveLights, showTooltips } = useConfig();

  const cardRef = useRef<HTMLDivElement>(null);

  const isBoardReady = useMemo(
    () => boardReady && !squaresError,
    [boardReady, squaresError]
  );

  const [customClass, setCustomClass] = useState<string>();

  useEffect(() => {
    const combined = [serverCustomClass, themeClass].filter(Boolean).join(' ') || undefined;
    setCustomClass(combined);
  }, [serverCustomClass, themeClass]);

  useEffect(() => {
    if (squaresError) {
      api.error({
        key: notificationKey,
        role: 'alert',
        duration: 0,
        title: 'Not Enough Squares!',
        description: (
          <Typography>
            <Typography.Paragraph>
              <Typography.Text strong>
                The game options selected do not generate enough squares
                to populate the board.
              </Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              Please modify the selected options to continue.
            </Typography.Paragraph>
          </Typography>
        )
      });
    }
  }, [api, squaresError]);

  return (
    <DrawerProvider>
      <ShareProvider cardRef={cardRef}>
      <div className={['app-shell', customClass].filter(Boolean).join(' ')}>
        {contextHolder}
        <Layout className={`app app-${themeName}`}>
          {festiveLights && <AppLights />}
          <Header>
            <AppHeader themeName={themeName} />
            <AppDrawer customClass={customClass} />
          </Header>
          <Content>
            <Layout>
              <Status themeName={themeName} />
              <div className="board-wrapper">
                <Spin size="large" spinning={groupsLoading || !isBoardReady}>
                  {boardReady && (
                    <Card
                      ref={cardRef}
                      customClass={customClass}
                    />
                  )}
                </Spin>
                {/*
                  Tooltip discovery hint. Gated on `showTooltips` so it never
                  promises an interaction the board will not honour, and on the
                  board being ready so it does not float under the spinner.
                */}
                {showTooltips && isBoardReady && (
                  <p className="board-hint">
                    Long-press (or hover on desktop) any square to see what it means
                  </p>
                )}
              </div>
            </Layout>
          </Content>
          {/* A band between the board and the footer, not an overlay: it takes
              its own room in the layout so it never covers the card it is
              celebrating. */}
          <WinBar />
          <Footer>
            <AppFooter themeName={themeName} />
          </Footer>
        </Layout>
        <SubmitSquare />
      </div>
      </ShareProvider>
    </DrawerProvider>
  );
}
