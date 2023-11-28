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
        </Content>
        <Footer>
          <AppFooter />
        </Footer>
      </Layout>
    </Space>
  );
}
