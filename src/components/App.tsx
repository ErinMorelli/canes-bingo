import { useEffect, useRef, useState } from 'react';
import { Layout, Skeleton, Space } from 'antd';
import { GithubFilled, HeartFilled } from '@ant-design/icons';

import BingoCard from './BingoCard';
import GameOptions from './GameOptions';

import { useGameBoard } from '../hooks';

const { Header, Content, Footer } = Layout

const VERSION_URL = 'https://api.github.com/repos/ErinMorelli/canes-bingo/commits';

async function getAppVersion() {
  try {
    const resp = await fetch(VERSION_URL);
    const commits: Array<{ sha: string }> = await resp.json();
    return commits[0].sha.slice(0, 7);
  } catch {
    return '';
  }
}

export default function App() {
  const [version, setVersion] = useState('');

  const { boardId, loadBoard } = useGameBoard();

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardId) loadBoard(boardId);
  }, []);

  useEffect(() => {
    getAppVersion().then((v) => {
      setVersion(v);
    });
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
          <small>
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
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
            <span className="divider">&bull;</span>
            <span className="version">
              {!version ? (
                <Skeleton.Input size="small" active />
              ) : (
                <a
                  href={`https://github.com/ErinMorelli/canes-bingo/commit/${version}`}
                  target="_blank"
                >{version}</a>
              )}
            </span>
          </small>
        </Footer>
      </Layout>
    </Space>
  );
}
