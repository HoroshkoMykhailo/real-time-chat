import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  prettier: ['./prettier.config.mjs'],
  stylelint: ['./stylelint.config.js'],
  workspaces: {
    '.': {},
    'apps/backend': {
      ignoreDependencies: ['pino-pretty']
    },
    'apps/frontend': {},
    'packages/shared': {
      includeEntryExports: true
    }
  }
};

export default config;
