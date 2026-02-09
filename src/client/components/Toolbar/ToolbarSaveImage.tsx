import { RefObject, useCallback, useState } from 'react';
import { LinkOutlined, SaveFilled } from '@ant-design/icons';
import { Button, message, Modal, Tooltip, Typography } from 'antd';
import html2canvas from 'html2canvas';

import { uploadImageToImgur } from '@app/utils.ts';

const { Link, Paragraph, Text } = Typography;

type SaveBoardImageProps = {
  cardRef: RefObject<HTMLDivElement>;
}

export function ToolbarSaveImage({ cardRef }: Readonly<SaveBoardImageProps>) {
  const [messageApi, contextHolder] = message.useMessage();

  const [saveLoading, setSaveLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgurLink, setImgurLink] = useState<string|undefined>(undefined);

  const imageError = useCallback((message: string) => {
    void messageApi.open({
      type: 'error',
      content: <Text>{message}. Please try again later.</Text>
    });
  }, [messageApi]);

  const saveImage = useCallback((blob: Blob | null) => {
    if (!blob) {
      setSaveLoading(false);
      imageError('Unable to save image');
      return;
    }

    const fileName = `BingoCard-${Date.now().toString()}`;
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    setSaveLoading(false);
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }, [imageError]);

  const shareImage = useCallback((blob: Blob | null) => {
    if (!blob) return;

    uploadImageToImgur(blob).then((result) => {
      setShareLoading(false);
      if (result === null) {
        imageError('Unable to get image link');
      } else {
        setImgurLink(result.data.link);
        setIsModalOpen(true);
      }
    })
  }, [imageError]);

  const takeScreenshot = async (
    cardRef: RefObject<HTMLDivElement>
  ): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;

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
    if (!app) return null;
    app.appendChild(card);

    return await html2canvas(card, { logging: false })
      .then((canvas) => {
        card.remove();
        return canvas;
      }).catch((err) => {
        card.remove();
        console.error(err);
        return null;
      });
  };

  const handleSaveImage = useCallback(() => {
    setSaveLoading(true);
    takeScreenshot(cardRef).then((canvas) => {
      if (canvas === null) {
        imageError('Unable to save image');
        setSaveLoading(false);
      } else {
        canvas.toBlob(saveImage, 'image/png');
      }
    });
  }, [cardRef, imageError, saveImage]);

  const handleShareImage = useCallback(() => {
    setShareLoading(true);
    takeScreenshot(cardRef).then((canvas) => {
      if (canvas === null) {
        imageError('Unable to get image link');
        setShareLoading(false);
      } else {
        canvas.toBlob(shareImage, 'image/png');
      }
    });
  }, [cardRef, imageError, shareImage]);

  return (
    <>
      {contextHolder}
      <Tooltip title="Save card image file">
        <Button
          onClick={handleSaveImage}
          aria-label="Save card image file"
          loading={saveLoading}
          icon={<SaveFilled />}
        />
      </Tooltip>
      <Tooltip title="Get card image link">
        <Button
          onClick={handleShareImage}
          aria-label="Get card image link"
          loading={shareLoading}
          icon={<LinkOutlined />}
        />
      </Tooltip>
      <Modal
        title="Image link"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        mask={true}
        footer={null}
        centered
      >
        <Paragraph
          style={{ textAlign: 'center', fontSize: 16 }}
          copyable={{ text: imgurLink }}
        >
          <Link href={imgurLink} target="_blank">
            <Text style={{ fontSize: 16 }}>{imgurLink}</Text>
          </Link>
        </Paragraph>
      </Modal>
    </>
  )
}
