import { useCallback, useState } from 'react';
import { Button, Input, Modal } from 'antd';

import { useSubmit } from '@hooks';

export function SubmitSquare() {
  const { isOpen, close } = useSubmit();

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
      the only place that has to change: post `idea`, keep the modal open and
      surface the error if it fails, and only call `handleClose` on success.

      Until then the button just closes, so nothing is silently dropped in a
      way that looks like it worked.
    */
    handleClose();
  }, [handleClose]);

  return (
    <Modal
      rootClassName="submit-modal"
      open={isOpen}
      onCancel={handleClose}
      width={580}
      centered
      // The design's footer is a sentence plus two buttons, which antd's
      // default ok/cancel pair cannot express.
      footer={null}
      title={
        <div className="submit-title">
          <span className="submit-title-main">Submit a Square</span>
          <span className="submit-title-sub">
            Good ones get added to the pool for everyone.
          </span>
        </div>
      }>
      <div className="submit-field">
        <label className="submit-label" htmlFor="submit-idea">Your idea</label>
        <Input
          id="submit-idea"
          value={idea}
          onChange={({ target }) => setIdea(target.value)}
          placeholder="Something that happens during a Canes game"
        />
        <span className="submit-help">
          Describe it however you like — we&apos;ll write the short version
          that goes on the card.
        </span>
      </div>
      <div className="submit-actions">
        <span className="submit-note">
          A caniac reads every submission. No account needed.
        </span>
        <Button className="submit-cancel" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="submit-confirm"
          type="primary"
          disabled={!idea.trim()}
          onClick={handleSubmit}>
          Submit for review
        </Button>
      </div>
    </Modal>
  );
}
