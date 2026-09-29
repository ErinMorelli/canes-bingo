import { PlusCircleOutlined } from '@ant-design/icons';

import { useConfig, useSubmit } from '@hooks';

import { footerMuted } from '@app/themes';

type InventoryFooterProps = {
  readonly isCompact: boolean;
}

/**
 * The squares database has its own footer rather than the site one.
 *
 * The design makes it a different thing on each breakpoint: phones get the
 * submit CTA itself, pinned to the bottom of the shell, while desktop gets a
 * sentence and the short disclaimer. Neither carries the board footer's
 * buttons or credits.
 */
export function InventoryFooter({ isCompact }: InventoryFooterProps) {
  const { theme } = useConfig();
  const { open: openSubmit } = useSubmit();

  const color = footerMuted[theme.name];

  if (isCompact) {
    return (
      <div className="db-footer" style={{ color }}>
        <button type="button" className="db-footer-cta" onClick={openSubmit}>
          <PlusCircleOutlined />
          Submit a Square
        </button>
        <span className="db-footer-note">
          Missing something? Every square here started as a submission.
        </span>
      </div>
    );
  }

  return (
    <div className="db-footer" style={{ color }}>
      <span>
        Missing a square?{' '}
        <button type="button" className="db-footer-link" onClick={openSubmit}>
          Submit it
        </button>
        {' '}— every square here started that way.
      </span>
      <span className="db-footer-disclaimer">
        This is an unofficial fan site, not affiliated with the Carolina
        Hurricanes or the NHL.
      </span>
    </div>
  );
}
