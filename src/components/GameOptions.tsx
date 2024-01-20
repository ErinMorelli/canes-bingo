import { RefObject, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Select, Space, Tooltip } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';

import { useGameBoard } from '../hooks';
import { BoardArgs, Broadcast, Game } from '../types';
import { selectBroadcast, selectGame, updateBoardArgs } from '../slices';

type GameOptionsProps = {
  cardRef: RefObject<HTMLDivElement>;
};

export default function GameOptions({ cardRef }: GameOptionsProps) {
  const dispatch = useDispatch();
  const { resetBoard } = useGameBoard();

  const game = useSelector(selectGame);
  const broadcast = useSelector(selectBroadcast);

  function handleReload() {
    resetBoard();
  }

  function handleBoardArgsChange(newBoardArgs: BoardArgs) {
    dispatch(updateBoardArgs(newBoardArgs));
  }

  const handleGameChange = useCallback((newGame: Game) => {
    handleBoardArgsChange({ broadcast, game: newGame });
  }, [broadcast]);

  const handleBroadcastChange = useCallback((newBroadcast: Broadcast) => {
    handleBoardArgsChange({ game, broadcast: newBroadcast });
  }, [game]);

  const handleScreenshot = useCallback(() => {
    if (!cardRef.current) return;

    const card = document.createElement('div');
    card.classList.add('card-image');

    const cardHeader = document.createElement('h3');
    cardHeader.innerText = 'Carolina Hurricanes Bingo';
    card.appendChild(cardHeader);

    const cardBody = cardRef.current.cloneNode(true);
    card.appendChild(cardBody);

    const cardFooter = document.createElement('small');
    cardFooter.innerText = 'bingo.svech.net';
    card.appendChild(cardFooter);

    document.body.appendChild(card);

    html2canvas(card).then((canvas) => {
      document.body.removeChild(card);
      const link = document.createElement("a");
      link.download = 'BingoCard.jpg';
      link.href = canvas.toDataURL('image/jpeg');
      link.click();
    })
    .catch((err) => {
      document.body.removeChild(card);
      console.log(err);
    });
  }, [cardRef]);

  return (
    <Space direction="horizontal" size="large" className="options">
      <Button
        onClick={handleReload}
        type="primary"
        icon={<ReloadOutlined />}
      >Generate Card</Button>
      <Space direction="horizontal" size="small">
        <label htmlFor="gameSelect">Location</label>
        <Select
          id="gameSelect"
          value={game}
          style={{ width: 110 }}
          onChange={handleGameChange}
          options={[
            { value: Game.HOME, label: 'Home' },
            { value: Game.AWAY, label: 'Away' }
          ]}
        />
      </Space>
      <Space direction="horizontal" size="small">
        <label htmlFor="broadcastSelect">Broadcast</label>
        <Select
          id="broadcastSelect"
          value={broadcast}
          style={{ width: 110 }}
          onChange={handleBroadcastChange}
          options={[
            { value: Broadcast.LOCAL, label: 'Local' },
            { value: Broadcast.NATIONAL, label: 'National' }
          ]}
        />
      </Space>
      <Tooltip title="Download card image">
        <Button
          onClick={handleScreenshot}
          shape="round"
          aria-label="Download card image"
          icon={<DownloadOutlined />}
        />
      </Tooltip>
    </Space>
  );
}
