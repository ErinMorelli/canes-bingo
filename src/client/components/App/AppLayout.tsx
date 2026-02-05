import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, notification, Space, Spin, Typography } from 'antd';

import { useGameBoard, useGroups, useSquares } from '@hooks';

import { Card } from '../Card';
import { Toolbar } from '../Toolbar';

import AppFooter from './AppFooter.tsx';
import { fetchConfigValue } from '@app/utils.ts';
import { ConfigKey } from '@app/constants.ts';
import { AppLights } from '@app/components/App/AppLights.tsx';

const { Header, Content, Footer } = Layout

const notificationKey = 'squaresError';

type AppLayoutProps = {
  themeClass?: string;
  themeName: string;
}

export function AppLayout({ themeClass, themeName }: AppLayoutProps) {
  const [api, contextHolder] = notification.useNotification({
    placement: 'top',
    maxCount: 1,
  });

  const { groupsLoaded, loadGroups } = useGroups();
  const { boardReady, loadBoard } = useGameBoard();
  const { squaresError } = useSquares();

  const cardRef = useRef<HTMLDivElement>(null);

  const isBoardReady = useMemo(
    () => boardReady && !squaresError,
    [boardReady, squaresError]
  );

  const [headerText, setHeaderText] = useState<string>();
  const [customClass, setCustomClass] = useState<string>();
  const [playoffWins, setPlayoffWins] = useState<number>();
  const [lightsEnabled, setLightsEnabled] = useState(false);

  useEffect(() => {
    fetchConfigValue(ConfigKey.HeaderText).then(setHeaderText);
  }, []);

  useEffect(() => {
    fetchConfigValue(ConfigKey.CustomClass).then((customClass) => {
      if (themeClass) {
        setCustomClass(`${customClass} ${themeClass}`);
      } else {
        setCustomClass(customClass);
      }
      const parsed = /playoffs(\s(\d+)-wins?)?/.exec(customClass);
      if (parsed) {
        setPlayoffWins(Number.parseInt(parsed[2] || '0'));
      }
    });
  }, [themeClass]);

  useEffect(() => {
    fetchConfigValue(ConfigKey.FestiveLights).then((val) => {
      if (val?.toLowerCase().trim() === 'on') {
        setLightsEnabled(true);
      } else {
        setLightsEnabled(false);
      }
    })
  }, []);

  useEffect(() => loadGroups());

  useEffect(() => {
    if (groupsLoaded) loadBoard();
  }, [groupsLoaded, loadBoard]);

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
        {lightsEnabled && <AppLights />}
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
              <Spin size="large" spinning={!isBoardReady}>
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
                Have an idea for a new square?&nbsp;
                <a
                  href="https://forms.gle/LS87Lr95QDixh9At5"
                  target="_blank"
                  rel="noreferrer nofollow"
                  aria-label="Bingo square idea submission form">
                  Submit it here
                </a>!
              </p>
              <p>
                Not sure what a square means?&nbsp;
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
