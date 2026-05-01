import { writeFile } from 'node:fs/promises';
import { Integration } from 'express-zod-api';

import { routing } from '../src/server/routing';

const integration = await Integration.create({
  routing,
  config: {
    cors: false,
    inputSources: {
      get: ['query', 'params'],
      post: ['body', 'params'],
      put: ['body', 'params'],
      delete: ['params'],
      patch: ['body', 'params'],
    },
  },
  serverUrl: '',
  clientClassName: 'ApiClient',
  variant: 'client',
});

const code = await integration.printFormatted();
await writeFile('src/client/api-client.ts', code, 'utf8');
console.info('Generated src/client/api-client.ts');
