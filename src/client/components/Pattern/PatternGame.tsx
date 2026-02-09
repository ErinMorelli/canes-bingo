import { useCallback, useState } from 'react';
import { Flex, Typography } from 'antd';

import { Game } from '@app/types.ts';

import { PatternAnimated } from './PatternAnimated.tsx';

type PatternGameProps = {
  readonly game: Game,
  readonly size?: number,
  readonly isEnabled?: boolean;
};

export function PatternGame({
  game,
  size = 8,
  isEnabled = true
}: PatternGameProps)  {
  const [animate, setAnimate] = useState(false);

  const startAnimate = useCallback(() => {
    if (isEnabled) {
      setAnimate(true);
    }
  }, [isEnabled]);

  const stopAnimate = useCallback(() => {
    setAnimate(false);
  }, []);

  return (
    <Flex
      className="game-pattern-select-option"
      orientation="horizontal"
      align="center"
      gap="10px"
      onMouseEnter={startAnimate}
      onMouseLeave={stopAnimate}
    >
      <PatternAnimated
        size={size}
        animate={animate}
        patterns={game.patterns}
      />
      <Typography.Text>{game.name}</Typography.Text>
    </Flex>
  );
}
