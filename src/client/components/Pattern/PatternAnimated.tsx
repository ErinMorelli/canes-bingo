import { Patterns } from '@app/types.ts';

import { Pattern } from '../Pattern';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_SPEED = 350;

type PatternAnimatedProps = {
  patterns: Patterns;
  size?: number;
  speed?: number;
  animate?: boolean;
}

export function PatternAnimated({
  patterns,
  size,
  speed,
  animate,
}: PatternAnimatedProps) {
  const [visible, setVisible] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout>();

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      setVisible(0);
    }
  }, [intervalRef]);

  const startAnimation = useCallback(() => {
    if (intervalRef.current || !patterns.length) return;

    const maxIdx = patterns.length - 1;
    let idx = 0;

    intervalRef.current = setInterval(() => {
      let next = idx + 1;
      if (next > maxIdx) next = 0;
      idx = next;
      setVisible(next);
    }, speed || DEFAULT_SPEED);
  }, [intervalRef, patterns, speed]);

  useEffect(() => {
    if (animate) {
      startAnimation();
    } else {
      stopAnimation();
    }
    return () => stopAnimation();
  }, [animate, startAnimation, stopAnimation]);

  const selected = useMemo(() => {
    if (patterns[visible]) {
      return patterns[visible].squares;
    }
    if (patterns.length) {
      return patterns[0].squares;
    }
    return [];
  }, [patterns, visible])

  return patterns.length > 0 ? (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={startAnimation}
      onMouseLeave={stopAnimation}
      onFocus={startAnimation}
      onBlur={stopAnimation}
    >
      <Pattern selected={selected} size={size} />
    </div>
  ) : null;
}
