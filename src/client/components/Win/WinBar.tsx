import { useEffect, useMemo, useRef } from 'react';

import { useConfig, useGameBoard, useGames, useShare } from '@hooks';

import { footerMuted } from '@app/themes';

import { fireCannons } from './cannons';

/**
 * The win celebration: two confetti cannons, then a bar above the footer.
 *
 * Deliberately not a dialog. Wins are frequent — Any Five is the default and
 * has twelve patterns of four or five squares — so the moment has to be cheap
 * to dismiss, and the board has to stay live underneath: a mis-tap is taken
 * back by tapping the square again, which is why there is no undo here. The
 * two actions worth surfacing are sharing the card and the one escalation the
 * app has; "generate a new card" is already a tap away in the header.
 */
export function WinBar() {
  const {
    hasWon, winningPattern, canKeepPlaying, daubCount, dismissWin, keepPlaying,
  } = useGameBoard();
  const { selectedGame } = useGames();
  const { share, isSharing } = useShare();
  const { theme } = useConfig();

  /**
   * Brand colours only. The ink is the theme's own text colour on the light
   * grounds, but white on Dark — where the ink *is* white — so the palette
   * always has something that reads against the shell the pieces fly over.
   */
  const confettiColours = useMemo(() => {
    const accent = theme.config?.token?.colorPrimary ?? '#CE1126';
    const ink = theme.name === 'dark' ? '#FFFFFF' : theme.config?.token?.colorText ?? '#000000';
    return [accent, ink, footerMuted[theme.name] ?? '#A4A9AD', accent];
  }, [theme]);

  /**
   * Which win has already been celebrated, so the cannons fire once per win
   * rather than on every re-render while the bar is up.
   *
   * Keyed on the pattern, not a boolean: completing a second pattern after
   * dismissing the first is a new win and earns its own volley.
   */
  const firedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!hasWon || !winningPattern) return;
    if (firedFor.current === winningPattern.id) return;

    firedFor.current = winningPattern.id;

    // A win restored from the last session gets the bar but not the cannons —
    // it was celebrated when it happened. Only a win a tap just produced is
    // new, which is what a daub this session proves.
    if (daubCount === 0) return;

    // No delay: the confetti is the first thing that happens, and the bar's own
    // entrance animation carries the beat between them.
    fireCannons(confettiColours);
  }, [hasWon, winningPattern, daubCount, confettiColours]);

  // Forget the volley once the win is gone, so re-completing the same pattern
  // on a later board celebrates again.
  useEffect(() => {
    if (!hasWon) firedFor.current = null;
  }, [hasWon]);

  if (!hasWon) return null;

  return (
    <div className="win-bar" role="status">
      <div className="win-bar-inner">
        <div className="win-bar-title">
          <span className="win-bar-shout">BINGO!</span>
          {/* The game, not the individual pattern: the strip above already
              names it this way, and "Diagonal Line 2" is an internal label. */}
          <span className="win-bar-pattern">{selectedGame?.name}</span>
        </div>
        <div className="win-bar-actions">
          <button
            type="button"
            className="win-bar-share"
            disabled={isSharing}
            onClick={share}>
            {isSharing ? 'Getting link…' : 'Share card'}
          </button>
          {/* Nothing to escalate to once blackout is the pattern being played. */}
          {canKeepPlaying && (
            <button type="button" className="win-bar-ghost" onClick={keepPlaying}>
              Keep playing &rarr; Blackout
            </button>
          )}
        </div>
        {/* Last in the DOM on purpose — see the focus-order note in the SCSS. */}
        <button
          type="button"
          className="win-bar-close"
          aria-label="Dismiss"
          onClick={dismissWin}>
          &#10005;
        </button>
      </div>
    </div>
  );
}
