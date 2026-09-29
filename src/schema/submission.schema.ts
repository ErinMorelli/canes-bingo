import { z } from 'zod';

/**
 * Longest idea we will take.
 *
 * Sized to the board rather than to a database column: the square's
 * fit-to-width ladder bottoms out at 10px, past which a label stops being
 * readable at all. An idea longer than this cannot become a square, so there
 * is no point accepting it — and the field is a single line, not an essay
 * box, which the copy under it already sets up.
 */
export const SUBMISSION_MAX_LENGTH = 120;

export const submissionInputSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(3, 'Tell us a little more than that')
    .max(SUBMISSION_MAX_LENGTH, 'That is a bit long for a square'),
});

/**
 * Deliberately just an acknowledgement. Where the submission actually goes is
 * the server's business, and the client should not learn anything about the
 * destination it could come to depend on.
 */
export const submissionOutputSchema = z.object({
  received: z.literal(true),
});

export type SubmissionInput = z.infer<typeof submissionInputSchema>;
