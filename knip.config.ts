import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  prettier: ['./prettier.config.mjs'],
  stylelint: ['./stylelint.config.js'],
  workspaces: {
    '.': {},
    'apps/backend': {
      entry: ['src/index.ts', 'src/db/**/*.ts'],
      ignoreBinaries: ['ts-paths-esm-loader'],
      ignoreDependencies: ['ts-paths-esm-loader', 'pino-pretty']
    },
    'apps/frontend': {
      entry: ['src/index.tsx']
    },
    'packages/shared': {
      entry: ['src/index.ts'],
      includeEntryExports: true
    }
  }
};

export default config;
