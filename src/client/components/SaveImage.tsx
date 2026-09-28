import { LinkOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import { useShare } from '@hooks';

/**
 * The header's share affordance. The capture, upload and link modal all live in
 * ShareProvider, because the win bar offers the same action and the two must
 * not each own a copy of that state.
 */
export function SaveImage() {
  const { share, isSharing } = useShare();

  return (
    <Tooltip title="Get card image link">
      <Button
        onClick={share}
        aria-label="Get card image link"
        loading={isSharing}
        icon={<LinkOutlined />}
      />
    </Tooltip>
  );
}
