import { RefObject, useCallback, useMemo, useState } from 'react';
import { message, Modal, Typography } from 'antd';

import html2canvas from 'html2canvas';

import { uploadImageToImgur } from '@app/utils';

import { ShareContext } from './contexts';

const { Link, Paragraph, Text } = Typography;

/**
 * Renders the card to an image, uploads it, and hands back a link.
 *
 * This used to live inside SaveImage, which owned both the action and the
 * header button that triggered it. The win bar needs the same action from a
 * different part of the tree, and two SaveImages would mean two independent
 * loading states and two link modals — so the action and its modal moved up
 * here, and SaveImage is now just one of the buttons that calls it.
 *
 * Mounted inside the page's themed ConfigProvider, not at the app root: the
 * modal picks its colours from the CSS-var scope it renders in, and above the
 * theme it comes out in antd's default blue.
 */
export function ShareProvider({
  cardRef,
  children,
}: Readonly<{ cardRef: RefObject<HTMLDivElement>; children: React.ReactNode }>) {
  const [messageApi, contextHolder] = message.useMessage();

  const [isSharing, setIsSharing] = useState(false);
  const [link, setLink] = useState<string>();

  const reportError = useCallback(
    (reason: string) => {
      void messageApi.open({
        type: 'error',
        content: <Text>{reason}. Please try again later.</Text>,
      });
    },
    [messageApi]
  );

  /**
   * Clones the board into a titled, captioned frame so the shared image stands
   * on its own, captures that, then removes it. Appended to the themed layout
   * rather than to the body so it inherits the card's own colours.
   */
  const capture = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;

    const frame = document.createElement('div');
    frame.classList.add('card-image');

    const heading = document.createElement('h3');
    heading.innerText = 'Carolina Hurricanes Bingo';
    frame.appendChild(heading);

    frame.appendChild(cardRef.current.cloneNode(true));

    const caption = document.createElement('small');
    caption.innerText = 'bingo.svech.net';
    frame.appendChild(caption);

    const layout = document.querySelector('.ant-layout.app');
    if (!layout) return null;
    layout.appendChild(frame);

    try {
      return await html2canvas(frame, { logging: false });
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      frame.remove();
    }
  }, [cardRef]);

  const share = useCallback(() => {
    setIsSharing(true);

    void capture()
      .then((canvas) => {
        if (!canvas) throw new Error('capture failed');
        return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      })
      .then((blob) => {
        if (!blob) throw new Error('no image data');
        return uploadImageToImgur(blob);
      })
      .then((result) => {
        if (result === null) throw new Error('no link returned');
        setLink(result.data.link);
      })
      .catch((error: unknown) => {
        console.error(error);
        reportError('Unable to get image link');
      })
      .finally(() => setIsSharing(false));
  }, [capture, reportError]);

  const value = useMemo(() => ({ share, isSharing }), [share, isSharing]);

  return (
    <ShareContext.Provider value={value}>
      {contextHolder}
      {children}
      <Modal
        title="Image link"
        open={link !== undefined}
        onCancel={() => setLink(undefined)}
        onOk={() => setLink(undefined)}
        mask={true}
        footer={null}
        centered>
        <Paragraph style={{ textAlign: 'center', fontSize: 16 }} copyable={{ text: link }}>
          <Link href={link} target="_blank">
            <Text style={{ fontSize: 16 }}>{link}</Text>
          </Link>
        </Paragraph>
      </Modal>
    </ShareContext.Provider>
  );
}
