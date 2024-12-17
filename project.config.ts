const ProjectPrefix = {
  CHANGE_TYPES: [
    'build',
    'chore',
    'ci',
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    'revert',
    'style',
    'test'
  ],
  ENVIRONMENTS: ['production', 'development'],
  ISSUE_PREFIXES: ['rtc'],
  SCOPES: {
    APPS: ['frontend', 'backend'],
    PACKAGES: ['shared']
  }
} as const;

export { ProjectPrefix };
