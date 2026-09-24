import { useEffect, useState } from 'react';

import { useConfig } from '@hooks';

export function StatusPlayoffs() {
  const { customClass } = useConfig();

  const [playoffWins, setPlayoffWins] = useState<number>();

  useEffect(() => {
    if (customClass) {
      const parsed = /playoffs(\s(\d+)-wins?)?/.exec(customClass);
      if (parsed) {
        setPlayoffWins(Number.parseInt(parsed[2] || '0'));
      }
    }
  }, [customClass]);

  return (
    <>
      {playoffWins !== undefined && playoffWins >= 0 && (
        <div className="playoff-wins">
          {Array.from({ length: playoffWins }).map((_, idx) =>
            <div
              className="win"
              title={`WIN #${idx+1}`}
              key={`WIN #${idx+1}`}></div>
          )}
          {Array.from({ length: 16 - playoffWins }).map((_, idx) =>
            <div
              className="tbd"
              title="TBD"
              key={`TBD #${idx+1}`}></div>
          )}
        </div>
      )}
    </>
  );
}
