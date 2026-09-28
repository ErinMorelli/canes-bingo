import { useMemo } from 'react';

import { useConfig } from '@hooks';

/** Four rounds of four wins is the Cup. */
const WINS_PER_ROUND = 4;
const ROUNDS = 4;
const CUP_WINS = WINS_PER_ROUND * ROUNDS;

/**
 * The playoff run: sixteen wins to the Cup, one pip each.
 *
 * Only appears when the server's config class says so — `playoffs`, or
 * `playoffs 7-wins` to fill in the count. Out of the playoffs the whole band
 * is absent rather than empty, so the regular season pays nothing for it.
 *
 * The pips are grouped in fours. That costs nothing and is the difference
 * between a row of sixteen marks and being able to see which round the team
 * is in — the count is all the server gives us, so the grouping has to do
 * that work on its own.
 */
export function StatusPlayoffs() {
  const { customClass } = useConfig();

  const wins = useMemo(() => {
    const parsed = /playoffs(?:\s(\d+)-wins?)?/.exec(customClass ?? '');
    if (!parsed) return null;
    // Clamped: a stray config value should not render a 40-pip band.
    return Math.min(Math.max(Number.parseInt(parsed[1] ?? '0', 10) || 0, 0), CUP_WINS);
  }, [customClass]);

  if (wins === null) return null;

  return (
    /*
      One image with one label. Sixteen unlabelled divs announce as nothing
      useful, and the old per-pip `title="WIN #3"` made a screen reader read
      out sixteen of them to convey a single number.
    */
    <div
      className="playoff-wins"
      role="img"
      aria-label={`Playoff run: ${wins} of ${CUP_WINS} wins to the Stanley Cup`}>
      {Array.from({ length: ROUNDS }, (_, round) => (
        <div className="playoff-round" key={round}>
          {Array.from({ length: WINS_PER_ROUND }, (_, i) => {
            const win = round * WINS_PER_ROUND + i + 1;
            return <div className={win <= wins ? 'win' : 'tbd'} key={win} />;
          })}
        </div>
      ))}
    </div>
  );
}
