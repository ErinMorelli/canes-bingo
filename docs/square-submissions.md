# Square submissions

The in-app "Submit a Square" modal posts to `POST /api/v1/submissions` on this
server, which forwards the idea to a Google Apps Script web app bound to the
same spreadsheet the Google Form writes to. Submissions from both routes land
in one place, and this app owns no table for them.

The client only ever knows about our own endpoint. Changing where submissions
go — to Formspree, an inbox, a real table — is a change to
`src/server/controllers/submissions.controller.ts` and nothing else.

## Configuration

One environment variable:

```
SQUARE_SUBMISSION_URL=https://script.google.com/macros/s/…/exec
```

Unset, the endpoint answers **503** and the modal keeps the text on screen with
an error. It never reports success for a submission that went nowhere.

## The Apps Script

From the responses spreadsheet: **Extensions → Apps Script**, paste the
following, then **Deploy → New deployment → Web app** with *Execute as: Me* and
*Who has access: Anyone*. Copy the resulting `/exec` URL into the variable
above.

```js
/** Tab to append to. The Google Form owns its own tab; this keeps its own. */
const SHEET_NAME = 'In-app submissions';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const idea = (payload.idea || '').toString().trim();

  // Throwing is deliberate — see "Why this throws" below.
  if (!idea) throw new Error('missing idea');

  const book = SpreadsheetApp.getActive();
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted at', 'Idea', 'Source']);
  }

  sheet.appendRow([payload.submittedAt || new Date().toISOString(), idea, 'in-app']);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Why this throws instead of returning an error

An Apps Script web app **cannot set an HTTP status code**. Anything returned
through `ContentService` comes back as `200`, so a script that politely
returned `{ ok: false }` would look like success to the forwarder, and the
modal would tell someone their idea was sent when it was not.

An *unhandled* exception is the one thing that does produce a non-2xx, so the
script throws and the forwarder's `response.ok` check catches it. That also
keeps the forwarder provider-agnostic: it reads the status and nothing about
the body, so a different backend drops in without touching it.

Worth confirming on your first deployment that a thrown error does surface as
a non-2xx for you — it is the one behaviour here that depends on Apps Script's
own error handling rather than on our code.

### Notes

- Apps Script answers a web app with a `302` to `script.googleusercontent.com`.
  `fetch` follows redirects by default, so the forwarder sees the real result.
- Re-deploy as a **new version** after editing the script, or the `/exec` URL
  keeps serving the old code.

## What the server sends

```json
{ "idea": "Rod chews gum on camera", "submittedAt": "2026-09-28T22:42:55.838Z" }
```

`Content-Type: application/json`. The idea is trimmed and length-checked before
it gets here.

## Limits

- **Length** — `SUBMISSION_MAX_LENGTH` in `src/schema/submission.schema.ts`
  (120), shared by the server's validation and the input's `maxLength`, so the
  cap is felt while typing rather than reported after pressing the button. It
  is sized to the board: the square's fit-to-width ladder bottoms out at 10px,
  past which a label cannot be read.
- **Rate** — 10 per hour per IP, applied to this path alone in `main.ts`. It is
  the app's only unauthenticated write. Scoped to the route, so tripping it
  cannot lock anyone out of the board.
