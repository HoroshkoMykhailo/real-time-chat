import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['apps/backend/public/**'],
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
