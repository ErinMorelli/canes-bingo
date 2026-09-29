import { ShareAltOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useShare } from '@hooks';

/**
 * The header's share affordance. The rendering and everything that happens to
 * the finished image live in ShareProvider, because the win bar offers the
 * same action and the two must not each own a copy of that state.
 */
export function SaveImage() {
  const { share, isSharing } = useShare();

  return (
    <Button
      onClick={share}
      title="Share your card"
      loading={isSharing}
      icon={<ShareAltOutlined />}
    />
  );
}
