import { RefObject, useCallback, useState } from 'react';
import { SaveFilled } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import html2canvas from 'html2canvas';

type SaveBoardImageProps = {
  cardRef: RefObject<HTMLDivElement>;
}

export function ToolbarSaveImage({ cardRef }: SaveBoardImageProps) {
  const [loading, setLoading] = useState(false);

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

    document.body.appendChild(card);

    html2canvas(card, { logging: false }).then((canvas) => {
      document.body.removeChild(card);
      setLoading(false);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const fileName = `BingoCard-${Date.now().toString()}.png`;
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = objectUrl;
        link.download = fileName;
        link.click();

        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }, 'image/png');
    })
    .catch((err) => {
      document.body.removeChild(card);
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