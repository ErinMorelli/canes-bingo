import { CSSProperties, useCallback } from 'react';
import { Button, Drawer, Flex, Spin } from 'antd';

import { useConfig, useDrawer, useGameBoard, useGroups, useMediaQuery } from '@hooks';

import { BP_COMPACT } from '@app/constants';
import { sheetHandle } from '@app/themes';

import { Options } from '@components/Options';
import { InfoCircleFilled } from '@ant-design/icons';

type AppDrawerProps = {
  customClass?: string;
}

export default function AppDrawer({ customClass = '' }: Readonly<AppDrawerProps>) {
  const { isOpen, close } = useDrawer();
  const { cardDirty, generateBoard, loadBoard, squaresError } = useGameBoard();
  const { isLoading: groupsLoading } = useGroups();
  const { theme } = useConfig();

  /**
   * Desktop gets a right-hand panel, phones get a bottom sheet. It is one
   * Drawer either way — `placement` is the whole difference — but because that
   * is a prop and not a style, it is the one part of the split the stylesheet
   * cannot own.
   */
  const isSheet = useMediaQuery(`(max-width: ${BP_COMPACT}px)`);

  const handleReset = useCallback(() => loadBoard(true), [loadBoard]);

  const handleGenerate = useCallback(() => {
    generateBoard();
    close();
  }, [generateBoard, close]);

  /**
   * Idle, the CTA is the theme's ink; dirty, it turns accent to say the staged
   * options are waiting on it. The design hardcodes white text, which would be
   * white-on-white once the dark theme inverts the ink, so the label follows
   * the same inversion the FREE square uses.
   */
  const idleCta: CSSProperties = {
    background: theme.config?.token?.colorText,
    borderColor: 'transparent',
    color: theme.name === 'dark' ? '#000000' : '#FFFFFF',
  };

  return (
    <Drawer
      title="Game Options"
      rootClassName={['options-drawer', customClass].filter(Boolean).join(' ')}
      placement={isSheet ? 'bottom' : 'right'}
      // One prop for both placements: antd maps `size` to height for a bottom
      // sheet and width for a side panel (`width`/`height` are deprecated in
      // v6). `auto` lets the sheet size to its content, capped in CSS, so a
      // short set of options does not leave a half-empty panel.
      size={isSheet ? 'auto' : 400}
      styles={{
        section: { '--sheet-handle': sheetHandle[theme.name] } as CSSProperties,
      }}
      open={isOpen || squaresError}
      /*
        A ✕ on both, at the start on the sheet so it does not fight Reset for
        the right-hand side.

        The sheet used to have none: the design dismisses it by dragging the
        handle, and antd's Drawer has no drag gesture, so the only ways out
        were an 8%-tall strip of scrim or the CTA — and the CTA deals a new
        card, which is not "close". Leaving on a destructive action is not a
        dismissal.
      */
      closable={{ placement: isSheet ? 'start' : 'end' }}
      onClose={() => !squaresError && close()}
      footer={
        <Flex className="drawer-footer" orientation="vertical" gap={10}>
          {/* Only shown once something is actually staged — otherwise it is
              an instruction with nothing to act on. */}
          {cardDirty && (
            <Flex className="drawer-footer-notice" align="center" gap={8}>
              <InfoCircleFilled />
              <div>These settings change which squares are eligible. Generate a new card to apply them.</div>
            </Flex>
          )}
          <Button
            className="drawer-footer-button"
            type="primary"
            style={cardDirty ? undefined : idleCta}
            onClick={handleGenerate}>
            {cardDirty ? 'Generate Updated Card' : 'Generate New Card'}
          </Button>
          {/* Keyboard-only instruction, so it stays on the panel. */}
          {!isSheet && (
            <Flex className="drawer-footer-sub" align="center" justify="center">
              Esc or click the board to close
            </Flex>
          )}
        </Flex>
      }
      extra={
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      }>
      <Spin size="large" spinning={groupsLoading}>
        {!groupsLoading && <Options />}
      </Spin>
    </Drawer>
  )
}
