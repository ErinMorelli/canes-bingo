import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, notification, Space, Spin, Typography } from 'antd';

import { useGameBoard, useGroups, useSquares } from '@hooks';

import { Card } from '../Card';
import { Toolbar } from '../Toolbar';

import AppFooter from './AppFooter.tsx';
import { fetchConfigValue } from '@app/utils.ts';
import { ConfigKey } from '@app/constants.ts';

const { Header, Content, Footer } = Layout

const notificationKey = 'squaresError';

export function AppLayout() {
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

  const [headerText, setHeaderText] = useState<string>()

  useEffect(() => {
    fetchConfigValue(ConfigKey.HeaderText).then(setHeaderText);
  }, []);

  useEffect(() => loadGroups(), []);

  useEffect(() => {
    if (groupsLoaded) loadBoard();
  }, [groupsLoaded]);

  useEffect(() => {
    if (squaresError) {
      api.error({
        key: notificationKey,
        role: 'alert',
        duration: 0,
        message: 'Not Enough Squares!',
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
    <Space direction="vertical" style={{ width: '100%' }}>
      {contextHolder}
      <Layout className="app">
        <Header>
          <h1>{headerText}</h1>
        </Header>
        <Layout>
          <Content>
            <Toolbar cardRef={cardRef} />
            <div className="board-wrapper">
              <Spin size="large" spinning={!isBoardReady}>
                {boardReady && <Card ref={cardRef} />}
              </Spin>
            </div>
            <div className="bottom-message">
              <p>
                Have an idea for a new square? <a
                  href="https://forms.gle/LS87Lr95QDixh9At5"
                  target="_blank"
                  rel="noreferrer nofollow"
                  aria-label="Bingo square idea submission form"
                >
                  Submit it here
                </a>!
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
