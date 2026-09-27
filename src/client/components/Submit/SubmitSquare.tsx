import { CSSProperties, useCallback, useEffect, useState } from 'react';
import { Button, Drawer, Input, Modal } from 'antd';

import { useConfig, useMediaQuery, useSubmit } from '@hooks';

import { BP_COMPACT } from '@app/constants';
import { sheetHandle } from '@app/themes';

export function SubmitSquare() {
  const { isOpen, close } = useSubmit();
  const { theme } = useConfig();

  /**
   * Desktop gets a centred dialog, phones a bottom sheet — the same split the
   * options drawer makes, and for the same reason: a centred dialog puts its
   * actions behind the on-screen keyboard, and a bottom-anchored sheet has
   * somewhere to go when that keyboard appears.
   */
  const isCompact = useMediaQuery(`(max-width: ${BP_COMPACT}px)`);

  const [idea, setIdea] = useState('');

  const handleClose = useCallback(() => {
    setIdea('');
    close();
  }, [close]);

  const handleSubmit = useCallback(() => {
    /*
      TODO: send the submission from here.

      Nothing is persisted yet — where suggestions should live is still an
      open question. Whatever it turns out to be (a `square_submissions`
      table behind a new public endpoint, a form service, an inbox), this is
      the only place that has to change: post `idea`, keep the sheet open and
      surface the error if it fails, and only call `handleClose` on success.

      Until then the button just closes, so nothing is silently dropped in a
      way that looks like it worked.
    */
    handleClose();
  }, [handleClose]);

  /**
   * Lifts the sheet clear of the on-screen keyboard.
   *
   * `interactive-widget=resizes-content` in the viewport meta covers Android
   * by shrinking the layout viewport, which a bottom-anchored sheet follows
   * for free. iOS ignores that hint — it shrinks only the *visual* viewport,
   * so a fixed sheet stays pinned to the bottom of the page and the keyboard
   * covers it. The gap between the two viewports is exactly how much is
   * covered, so it becomes the sheet's offset.
   *
   * Where the hint does apply, `innerHeight` shrinks along with the visual
   * viewport, the difference is ~0, and this contributes nothing rather than
   * shifting the sheet twice.
   */
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOpen || !isCompact || !viewport) return;

    const root = document.documentElement;
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      root.style.setProperty('--keyboard-inset', `${Math.max(0, covered)}px`);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.style.removeProperty('--keyboard-inset');
    };
  }, [isOpen, isCompact]);

  const title = (
    <div className="submit-title">
      <span className="submit-title-main">Submit a Square Idea</span>
    </div>
  );

  const field = (
    <div className="submit-field">
      <label className="submit-label" htmlFor="submit-idea">Your idea</label>
      <Input
        id="submit-idea"
        value={idea}
        onChange={({ target }) => setIdea(target.value)}
        placeholder="Something that happens during a Canes game"
      />
      <span className="submit-help">
        Describe it however you like and we&apos;ll write the short version
        that goes on the card.
      </span>
    </div>
  );

  const submitButton = (
    <Button
      className="submit-confirm"
      type="primary"
      disabled={!idea.trim()}
      onClick={handleSubmit}>
      Submit
    </Button>
  );

  if (isCompact) {
    return (
      <Drawer
        rootClassName="submit-sheet"
        placement="bottom"
        size="auto"
        open={isOpen}
        onClose={handleClose}
        closable={{ placement: 'end' }}
        title={title}
        styles={{
          section: { '--sheet-handle': sheetHandle[theme.name] } as CSSProperties,
        }}
        /*
          No Cancel on the sheet, matching the design: the ✕ and the scrim
          already dismiss it, and one full-width primary is a better thumb
          target than two half-width buttons.
        */
        footer={<div className="submit-actions">{submitButton}</div>}>
        {field}
      </Drawer>
    );
  }

  return (
    <Modal
      rootClassName="submit-modal"
      open={isOpen}
      onCancel={handleClose}
      width={580}
      centered
      footer={null}
      title={title}>
      {field}
      <div className="submit-actions">
        <Button className="submit-cancel" onClick={handleClose}>
          Cancel
        </Button>
        {submitButton}
      </div>
    </Modal>
  );
}
