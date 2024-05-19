/// <reference types="vitest" />
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      'lib/**/*',
      '.eslintrc.cjs',
      'vitest.workspace.ts',
    ],
    reporters: 'verbose',
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        'lib/**/*',
        '.eslintrc.cjs',
        'vitest.workspace.ts',
        '**/*.spec.ts',
        '**/*.e2e.ts',
      ],
    },
    watch: process.env.CI !== 'true',
  },
});
