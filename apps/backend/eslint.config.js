import baseConfig from '../../eslint.config.js';

/** @typedef {import("eslint").Linter.Config} */
let Config;

/** @type {Config} */
const ignoresConfig = {
  ignores: ['build', 'public']
};

/** @type {Config[]} */
const overridesConfigs = [
  {
    files: ['src/modules/user/user.service.ts'],
    rules: {
      'perfectionist/sort-classes': 'off'
    }
  },
  {
    files: ['jest.config.js'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['off'],
      '@typescript-eslint/no-magic-numbers': ['off'],
      '@typescript-eslint/no-unsafe-argument': ['off'],
      '@typescript-eslint/no-unsafe-assignment': ['off'],
      '@typescript-eslint/no-unsafe-call': ['off'],
      '@typescript-eslint/no-unsafe-member-access': ['off'],
      '@typescript-eslint/no-unsafe-return': ['off'],
      'import/no-default-export': ['off']
    }
  },
  {
    files: ['src/libs/modules/controller/controller.module.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': ['off']
    }
  },
  {
    files: ['mongo-migrate-ts.config.ts'],
    rules: {
      'import/no-default-export': ['off']
    }
  }
];

/** @type {Config[]} */
const config = [...baseConfig, ignoresConfig, ...overridesConfigs];

export default config;
