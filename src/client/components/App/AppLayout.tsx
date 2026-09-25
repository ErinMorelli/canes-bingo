import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, notification, Space, Spin, Typography } from 'antd';

import { useConfig, useGameBoard, useGroups } from '@hooks';

import { Card } from '@components/Card';
import { Status } from '@components/Status';

import { DrawerProvider } from '@context/DrawerContext';

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
  const { customClass: serverCustomClass, festiveLights } = useConfig();

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
      <Space orientation="vertical" style={{ width: '100%' }} className={customClass}>
        {contextHolder}
        <Layout className={`app app-${themeName}`}>
          {festiveLights && <AppLights />}
          <Header>
            <AppHeader themeName={themeName} cardRef={cardRef} />
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
                      notify={api}
                      customClass={customClass}
                    />
                  )}
                </Spin>
              </div>
            </Layout>
          </Content>
          <Footer>
            <AppFooter themeName={themeName} />
          </Footer>
        </Layout>
      </Space>
    </DrawerProvider>
  );
}
