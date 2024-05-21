import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: ['**/*.spec.ts'],
    },
  },
  {
    test: {
      name: 'e2e',
      include: ['**/*.e2e.ts'],
      testTimeout: 10000,
    },
  },
]);
