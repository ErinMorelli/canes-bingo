import createHttpError from 'http-errors';

/**
 * Square submissions are forwarded to a Google Apps Script web app, which
 * appends them to the same sheet the existing Google Form writes to — so
 * everything arrives in one place and this app owns no table for them.
 *
 * It goes through the server rather than posting from the browser for three
 * reasons, none of which are about Apps Script specifically:
 *
 *  - The destination stays out of the bundle, so it cannot be scraped off the
 *    client and posted to directly.
 *  - Same-origin, so there is no CORS to negotiate and no opaque `no-cors`
 *    response to guess at — we see the real status and the modal can report a
 *    real failure.
 *  - The provider becomes swappable. Everything the client knows is
 *    `POST /api/v1/submissions`, so moving to Formspree or anything else is a
 *    change to this file alone.
 */

/** Apps Script can be slow to wake; past this it is not worth the wait. */
const FORWARD_TIMEOUT_MS = 8000;

export async function forwardSubmission(idea: string): Promise<void> {
  const endpoint = process.env.SQUARE_SUBMISSION_URL;

  if (!endpoint) {
    /*
      Configuration is missing, so the submission has nowhere to go. 503
      rather than a quiet success: the whole point of the modal keeping the
      sheet open on failure is that nothing is silently dropped in a way that
      looks like it worked.
    */
    console.error('[submissions] SQUARE_SUBMISSION_URL is not set');
    throw createHttpError(503, 'Submissions are not configured right now');
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
  } catch (error) {
    // Network failure or timeout. The sender is not at fault, so this is a
    // 502 rather than anything in the 400s.
    console.error('[submissions] could not reach the submission endpoint:', error);
    throw createHttpError(502, 'Could not reach the submission service');
  }

  // Apps Script answers a web app with a 302 to script.googleusercontent.com;
  // fetch follows that by default, so `ok` reflects the real result.
  if (!response.ok) {
    console.error(`[submissions] endpoint replied ${response.status}`);
    throw createHttpError(502, 'The submission service rejected the request');
  }
}
