import { useDispatch, useSelector } from 'react-redux';
import { Button, Select, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import {
  selectBroadcast,
  selectGame,
  updateBroadcast,
  updateGame
} from '../slices/boardArgs';

import { useGameBoard } from '../hooks';
import { Broadcast, Game } from '../types';

export default function GameOptions() {
  const dispatch = useDispatch();
  const { resetBoard } = useGameBoard();

  const game = useSelector(selectGame);
  const broadcast = useSelector(selectBroadcast);

  function handleReload() {
    resetBoard();
  }

  function handleGameChange(newGame: Game) {
    dispatch(updateGame(newGame));
    resetBoard();
  }

  function handleBroadcastChange(newBroadcast: Broadcast){
    dispatch(updateBroadcast(newBroadcast));
    resetBoard();
  }

  return (
    <Space direction="horizontal" size="large" className="options">
      <Button
        onClick={handleReload}
        type="primary"
        icon={<ReloadOutlined />}
      >Generate Card</Button>
      <Space size="small">
        <label htmlFor="gameSelect">Location:</label>
        <Select
          id="gameSelect"
          value={game}
          style={{ width: 120 }}
          onChange={(value) => handleGameChange(value)}
          options={[
            { value: Game.HOME, label: 'Home' },
            { value: Game.AWAY, label: 'Away' }
          ]}
        />
      </Space>
      <Space size="small">
        <label htmlFor="broadcastSelect">Broadcast:</label>
        <Select
          id="broadcastSelect"
          value={broadcast}
          style={{ width: 120 }}
          onChange={(value) => handleBroadcastChange(value)}
          options={[
            { value: Broadcast.LOCAL, label: 'Local' },
            { value: Broadcast.NATIONAL, label: 'National' }
          ]}
        />
      </Space>
    </Space>
  );
}
