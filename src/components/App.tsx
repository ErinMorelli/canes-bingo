import { useEffect, useRef } from 'react';
import { Layout, Space } from 'antd';

import BingoCard from './BingoCard';
import GameOptions from './GameOptions';
import AppFooter from './AppFooter.tsx';

import { useGameBoard } from '../hooks';

const { Header, Content, Footer } = Layout

export default function App() {
  const { boardId, loadBoard } = useGameBoard();

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardId) loadBoard(boardId);
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Layout className="app">
        <Header>
          <h1>Carolina Hurricanes Bingo</h1>
        </Header>
        <Content>
          <GameOptions cardRef={cardRef}/>
          <BingoCard ref={cardRef} />
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
        <Footer>
          <AppFooter />
        </Footer>
      </Layout>
    </Space>
  );
}
