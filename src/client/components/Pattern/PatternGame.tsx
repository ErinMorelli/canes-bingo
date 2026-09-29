import { useCallback, useState } from 'react';

import { Game } from '@app/types';

import { PatternAnimated } from './PatternAnimated';

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
    <div
      className="game-pattern-select-option"
      onMouseEnter={startAnimate}
      onMouseLeave={stopAnimate}>
      <PatternAnimated
        size={size}
        animate={animate}
        patterns={game.patterns}
      />
    </div>
  );
}
