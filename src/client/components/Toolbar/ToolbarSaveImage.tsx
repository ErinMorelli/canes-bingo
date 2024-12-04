import { RefObject, useCallback, useState } from 'react';
import { SaveFilled } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import html2canvas from 'html2canvas';

type SaveBoardImageProps = {
  cardRef: RefObject<HTMLDivElement>;
}

export function ToolbarSaveImage({ cardRef }: Readonly<SaveBoardImageProps>) {
  const [loading, setLoading] = useState(false);

  const createImageLink = (app: Element) => (blob: Blob | null) => {
    if (!blob) return;

    const fileName = `BingoCard-${Date.now().toString()}.png`;
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.style.display = 'none';
    app.appendChild(link);
    link.href = objectUrl;
    link.download = fileName;
    link.click();

    app.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const handleScreenshot = useCallback(() => {
    if (!cardRef.current) return;
    setLoading(true);

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

    const app = document.querySelector('.ant-layout.app');
    if (!app) {
      setLoading(false);
      return;
    }

    app.appendChild(card);

    html2canvas(card, { logging: false }).then((canvas) => {
      app.removeChild(card);
      setLoading(false);
      canvas.toBlob(createImageLink(app), 'image/png');
    }).catch((err) => {
      app.removeChild(card);
      setLoading(false);
      console.error(err);
    });
  }, [cardRef]);

  return (
    <Tooltip title="Save card image">
      <Button
        onClick={handleScreenshot}
        aria-label="Save card image"
        loading={loading}
        icon={<SaveFilled />}
      />
    </Tooltip>
  )
}