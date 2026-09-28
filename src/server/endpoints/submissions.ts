import { submissionInputSchema, submissionOutputSchema } from '@schema/submission.schema';

import { forwardSubmission } from '@server/controllers';

import { publicFactory } from './factories';

/**
 * Public on purpose — the design's "No account needed" is the promise that
 * makes someone actually submit. It is the app's only unauthenticated write,
 * so the length cap lives in the schema and the rate limit is applied to this
 * path in main.ts.
 */
export const createSubmissionEndpoint = publicFactory.build({
  method: 'post',
  input: submissionInputSchema,
  output: submissionOutputSchema,
  handler: async ({ input: { idea } }) => {
    await forwardSubmission(idea);
    return { received: true as const };
  },
});
