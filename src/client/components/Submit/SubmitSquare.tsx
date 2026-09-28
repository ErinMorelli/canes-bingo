import { CSSProperties, useCallback, useEffect, useState } from 'react';
import { Button, Drawer, Input, message, Modal } from 'antd';

import { SUBMISSION_MAX_LENGTH } from '@schema/submission.schema';

import { useConfig, useMediaQuery, useSubmit } from '@hooks';

import { BP_COMPACT } from '@app/constants';
import { sheetHandle } from '@app/themes';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

export function SubmitSquare() {
  const { isOpen, close } = useSubmit();
  const { theme } = useConfig();
  /*
    Its own holder rather than `App.useApp()`: the app-level <App> sits above
    each page's themed ConfigProvider, so a toast from there comes out in
    antd's default blue. Rendered below, inside the theme.
  */
  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Desktop gets a centred dialog, phones a bottom sheet — the same split the
   * options drawer makes, and for the same reason: a centred dialog puts its
   * actions behind the on-screen keyboard, and a bottom-anchored sheet has
   * somewhere to go when that keyboard appears.
   */
  const isCompact = useMediaQuery(`(max-width: ${BP_COMPACT}px)`);

  const [idea, setIdea] = useState('');
  const [sending, setSending] = useState(false);

  const handleClose = useCallback(() => {
    setIdea('');
    close();
  }, [close]);

  /**
   * Posts to our own API, which forwards it on. The client deliberately knows
   * nothing about where a submission ends up — swapping the destination is a
   * server change and should never reach this file.
   */
  const handleSubmit = useCallback(() => {
    const text = idea.trim();
    if (!text || sending) return;

    setSending(true);
    void apiClient
      .provide(Api.submissions.create, { idea: text })
      .then((result) => {
        // `provide` resolves for failures too — the envelope carries the
        // status and `getData` is what turns an error into a throw. Without
        // it a rejected submission would close the sheet and read as sent.
        getData(result);
        // Only now: closing first would throw the text away on a failure and
        // look exactly like success.
        handleClose();
        void messageApi.success('Thanks — a caniac will read it.');
      })
      .catch((error: unknown) => {
        console.error(error);
        void messageApi.error('Could not send that. Please try again.');
      })
      .finally(() => setSending(false));
  }, [idea, sending, handleClose, messageApi]);

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
        // Matches the server's own cap, so the limit is felt while typing
        // rather than reported after pressing the button.
        maxLength={SUBMISSION_MAX_LENGTH}
        onPressEnter={handleSubmit}
        disabled={sending}
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
      loading={sending}
      disabled={!idea.trim()}
      onClick={handleSubmit}>
      Submit
    </Button>
  );

  if (isCompact) {
    return (
      <>
      {contextHolder}
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
      </>
    );
  }

  return (
    <>
    {contextHolder}
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
    </>
  );
}
