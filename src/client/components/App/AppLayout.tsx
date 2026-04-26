import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, notification, Space, Spin, Typography } from 'antd';

import { useConfig, useGameBoard, useGroups } from '@hooks';

import { Card } from '@components/Card';
import { Toolbar } from '@components/Toolbar';

import AppFooter from './AppFooter';
import { AppLights } from './AppLights';

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
  const { headerText, customClass: serverCustomClass, festiveLights } = useConfig();

  const cardRef = useRef<HTMLDivElement>(null);

  const isBoardReady = useMemo(
    () => boardReady && !squaresError,
    [boardReady, squaresError]
  );

  const [customClass, setCustomClass] = useState<string>();
  const [playoffWins, setPlayoffWins] = useState<number>();

  useEffect(() => {
    const combined = [serverCustomClass, themeClass].filter(Boolean).join(' ') || undefined;
    setCustomClass(combined);
    if (serverCustomClass) {
      const parsed = /playoffs(\s(\d+)-wins?)?/.exec(serverCustomClass);
      if (parsed) {
        setPlayoffWins(Number.parseInt(parsed[2] || '0'));
      }
    }
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
    <Space orientation="vertical" style={{ width: '100%' }} className={customClass}>
      {contextHolder}
      <Layout className={`app app-${themeName}`}>
        {festiveLights && <AppLights />}
        <Header>
          <h1>{headerText}</h1>
        </Header>
        <Layout>
          <Content>
            {playoffWins !== undefined && playoffWins >= 0 && (
              <div className="playoff-wins">
                {Array.from({ length: playoffWins }).map((_, idx) =>
                  <div
                    className="win"
                    title={`WIN #${idx+1}`}
                    key={`WIN #${idx+1}`}></div>
                )}
                {Array.from({ length: 16 - playoffWins }).map((_, idx) =>
                  <div
                    className="tbd"
                    title="TBD"
                    key={`TBD #${idx+1}`}></div>
                )}
              </div>
            )}
            <Toolbar cardRef={cardRef} customClass={customClass} />
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
            <div className="bottom-message">
              <p>
                Have an idea for a new square?{' '}
                <a
                  href="https://forms.gle/LS87Lr95QDixh9At5"
                  target="_blank"
                  rel="noreferrer nofollow"
                  aria-label="Bingo square idea submission form">
                  Submit it here
                </a>!
              </p>
              <p>
                Not sure what a square means?{' '}
                <Link to="/squares">Look up the meaning here</Link>!
              </p>
            </div>
          </Content>
        </Layout>
        <Footer>
          <AppFooter />
        </Footer>
      </Layout>
    </Space>
  );
}
