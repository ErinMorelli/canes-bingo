import { useEffect } from 'react';
import { Layout, Space } from 'antd';
import { GithubFilled, HeartFilled } from '@ant-design/icons';

import BingoCard from './BingoCard';
import GameOptions from './GameOptions';

import { useGameBoard } from '../hooks';

const { Header, Content, Footer } = Layout

export default function App() {
  const { boardId, loadBoard } = useGameBoard();

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
          <GameOptions />
          <BingoCard />
        </Content>
        <Footer>
          <small>
            <a
              href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noreferrer nofollow"
              className="license"
              title="Attribution-NonCommercial-ShareAlike 4.0 International"
            >
              <i className="icon-cc"></i>
              <i className="icon-cc-by"></i>
              <i className="icon-cc-nc"></i>
              <i className="icon-cc-sa"></i>
            </a> {new Date().getFullYear()}
            <span className="divider">&bull;</span>
            Made with <HeartFilled /> by <a href="https://erin.dev" target="_blank">Erin Morelli</a>
            <span className="divider">&bull;</span>
            <a
              href="https://github.com/ErinMorelli/canes-bingo"
              target="_blank"
              rel="noreferrer nofollow"
            >
              <GithubFilled /> View on GitHub
            </a>
          </small>
        </Footer>
      </Layout>
    </Space>
  );
}
