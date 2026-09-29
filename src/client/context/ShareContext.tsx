import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, message, Modal } from 'antd';

import { useConfig, useGameBoard, useGames, useMediaQuery } from '@hooks';

import { CardImageTheme, canvasToBlob, renderCardImage } from '@components/Share/cardImage';

import { ShareContext } from './contexts';

const FILE_NAME = 'canes-bingo-card.png';

/** Whether this browser can put an image on the clipboard. Firefox trails here. */
const canCopyImages =
  typeof ClipboardItem !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard?.write === 'function';

/**
 * The card's palette, read from the live CSS variables rather than rebuilt
 * from `themes.ts`.
 *
 * Several of the values the board actually paints with — `colorBgBase` above
 * all — are derived by antd rather than declared in our theme, so reading the
 * tokens object would come back undefined for exactly the ones that matter.
 * The variables on the themed root are what the board is using, so they are
 * also what the picture of the board should use.
 */
function readCardTheme(themeName: string): CardImageTheme {
  const root = document.querySelector('.ant-layout.app') ?? document.body;
  const styles = getComputedStyle(root);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  const isDark = themeName === 'dark';
  const ink = read('--ant-color-text', '#000000');

  return {
    ground: read('--ant-color-bg-layout', '#F4F5F6'),
    ink,
    accent: read('--ant-color-primary', '#CE1126'),
    muted: read('--ant-color-text-secondary', '#5F6467'),
    // Mirrors CardSquare: the dark theme lifts a square onto the container
    // surface, the light themes leave it on the base.
    squareBg: isDark
      ? read('--ant-color-bg-container', '#333F48')
      : read('--ant-color-bg-base', '#FFFFFF'),
    squareText: ink,
    // The free space is filled with the ink and writes in its inverse.
    freeBg: ink,
    freeText: isDark ? '#000000' : '#FFFFFF',
  };
}

/**
 * Renders the card to a PNG and gets it to wherever the player wants it.
 *
 * The delivery splits by device, because the useful destination does:
 *
 * - On a phone the OS share sheet lists *installed apps*, so Reddit, X and
 *   Messages are all one tap away. That is the whole point — it replaces
 *   screenshotting the board, which is what people do today.
 * - On a desktop the same call opens the *operating system's* sheet, which
 *   offers AirDrop, Mail and Notes and knows nothing about Reddit. It is the
 *   wrong tool there, even though `canShare` happily returns true. So desktop
 *   gets a preview of the card with copy and download instead, which is what
 *   actually pastes into a post.
 *
 * Gating on a coarse pointer rather than on `canShare` alone is what keeps
 * desktop off the useless path.
 */
export function ShareProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { board, winningSquares, hasWon } = useGameBoard();
  const { selectedGame } = useGames();
  const { theme, headerText, freeSpace } = useConfig();

  const isTouch = useMediaQuery('(pointer: coarse)');

  const [messageApi, contextHolder] = message.useMessage();
  const [isSharing, setIsSharing] = useState(false);
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null);
  const [copied, setCopied] = useState(false);

  // An object URL is a document-lifetime handle; without this every share
  // leaks one for as long as the tab is open.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);

  const closePreview = useCallback(() => {
    setPreview(null);
    setCopied(false);
  }, []);

  const share = useCallback(() => {
    setIsSharing(true);

    void (async () => {
      try {
        const canvas = renderCardImage({
          board,
          theme: readCardTheme(theme.name),
          headerText: headerText ?? 'Carolina Hurricanes',
          gameName: selectedGame?.name,
          freeSpaceLabel: freeSpace,
          winningSquares,
          hasWon,
        });
        const blob = await canvasToBlob(canvas);
        if (!blob) throw new Error('could not encode the card');

        const file = new File([blob], FILE_NAME, { type: 'image/png' });
        if (isTouch && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'My Carolina Hurricanes bingo card' });
            return;
          } catch (error) {
            // Dismissing the sheet rejects with AbortError: the player
            // changed their mind, and there is nothing to report or retry.
            if (error instanceof DOMException && error.name === 'AbortError') return;
            /*
              Anything else — the sheet refused, the platform declined the
              file — is the *delivery* failing, not the card. The image is
              already in hand, so fall through to the preview rather than
              reporting that we could not create it and leaving the player
              with nothing.
            */
            console.error('share sheet unavailable, falling back to preview:', error);
          }
        }

        setPreview({ url: URL.createObjectURL(blob), blob });
      } catch (error) {
        console.error(error);
        void messageApi.error('Could not create the card image. Please try again.');
      } finally {
        setIsSharing(false);
      }
    })();
  }, [board, theme, headerText, freeSpace, selectedGame, winningSquares, hasWon, isTouch, messageApi]);

  const copyImage = useCallback(() => {
    if (!preview) return;
    void (async () => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': preview.blob })]);
        setCopied(true);
      } catch (error) {
        console.error(error);
        void messageApi.error('Could not copy the image. Try downloading it instead.');
      }
    })();
  }, [preview, messageApi]);

  const downloadImage = useCallback(() => {
    if (!preview) return;
    const link = document.createElement('a');
    link.href = preview.url;
    link.download = FILE_NAME;
    link.click();
  }, [preview]);

  const value = useMemo(() => ({ share, isSharing }), [share, isSharing]);

  return (
    <ShareContext.Provider value={value}>
      {contextHolder}
      {children}
      <Modal
        className="share-modal"
        title="Your bingo card"
        open={preview !== null}
        onCancel={closePreview}
        footer={null}
        centered>
        {preview && (
          <>
            <img className="share-preview" src={preview.url} alt="Your bingo card" />
            <div className="share-actions">
              {canCopyImages && (
                <Button type="primary" onClick={copyImage}>
                  {copied ? 'Copied' : 'Copy image'}
                </Button>
              )}
              <Button onClick={downloadImage}>Download</Button>
            </div>
            <p className="share-hint">
              {canCopyImages
                ? 'Paste it straight into a post, or download it to keep.'
                : 'Download the card to post or share it.'}
            </p>
          </>
        )}
      </Modal>
    </ShareContext.Provider>
  );
}
