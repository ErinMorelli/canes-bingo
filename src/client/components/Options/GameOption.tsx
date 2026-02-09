import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Flex, Form, Modal, Select, Switch, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons'

import { Game } from '@app/types.ts';

import { useConfig, useGames } from '@hooks';

import { PatternAnimated, PatternGame } from '../Pattern';

const { Text, Title, Paragraph } = Typography;

type GameOptionType = {
  value: number;
  label: string;
  data: Game;
}

const tooltipText = 'Pick a bingo game pattern to play for and get notified when you win!';

export default function GameOption() {
  const { theme } = useConfig()
  const {
    games,
    gamesLoaded,
    selectedGame,
    isEnabled,
    loadGames,
    setSelectedGame,
    setIsEnabled,
  } = useGames();

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const [open, setOpen] = useState<boolean>(false);

  const handleChange = useCallback((value?: GameOptionType | GameOptionType[]) => {
    if (!value || Array.isArray(value)) return;
    setSelectedGame(value.data);
  }, [setSelectedGame]);

  const options = useMemo<GameOptionType[]>(() => {
    return games.map(game => ({
      value: game.id,
      label: game.name,
      data: game,
    }))
  }, [games]);

  const gameRender = useCallback((game?: Game) => {
    if (!game) return null;
    return <PatternGame game={game} isEnabled={isEnabled} />
  }, [isEnabled]);

  return gamesLoaded ? (
    <>
      <Flex orientation="vertical" gap="4px">
        <Form.Item
          className="game-pattern-select"
          tooltip={tooltipText}
          style={{ marginBottom: 0 }}
          label={
            <Flex orientation="horizontal" gap="10px">
              <Switch
                value={isEnabled}
                checkedChildren="On"
                unCheckedChildren="Off"
                onChange={(e) => setIsEnabled(e)}
              />
              <Text strong>Game Pattern</Text>
            </Flex>
          }
          extra={selectedGame?.description && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              disabled={!isEnabled}
              onClick={() => !open && setOpen(true)}
            >
              View Game Rules
            </Button>
          )}
        >
          <Select
            disabled={!isEnabled}
            value={selectedGame?.id}
            onChange={(_, opt) => handleChange(opt)}
            options={options}
            optionRender={({ data }) => gameRender(data.data)}
            labelRender={() => gameRender(selectedGame)}
            classNames={{
              popup: {
                root: 'game-pattern-select-popup'
              }
            }}
            showSearch={false}
          />
        </Form.Item>
      </Flex>
      {selectedGame && (
        <Modal
          open={open}
          footer={null}
          title={
            <Title
              level={4}
              style={{ color: theme.config.token?.colorPrimary }}
            >
              Game Rules: {selectedGame.name}
            </Title>
          }
          closable={{ onClose: () => setOpen(false) }}
          onCancel={() => setOpen(false)}
        >
          <Flex gap="20px">
            <div style={{ paddingTop: '5px' }}>
              <PatternAnimated
                patterns={selectedGame.patterns}
                animate={open}
                speed={500}
                size={20}
              />
            </div>
            <Paragraph>{selectedGame.description}</Paragraph>
          </Flex>
        </Modal>
      )}
    </>
  ) : null;
}