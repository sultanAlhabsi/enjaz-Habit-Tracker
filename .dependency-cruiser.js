/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Warn about circular dependencies which break runtime execution in React Native',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'components-not-to-screens',
      severity: 'error',
      comment: 'Reusable components must not depend on screens',
      from: {
        path: '^src/components',
      },
      to: {
        path: '^src/screens',
      },
    },
    {
      name: 'services-not-to-screens',
      severity: 'error',
      comment: 'Core services must not depend on UI screens or components',
      from: {
        path: '^src/services',
      },
      to: {
        path: '^(src/screens|src/components)',
      },
    },
    {
      name: 'utils-must-be-pure',
      severity: 'warn',
      comment: 'Utility modules should ideally be pure and not import UI components',
      from: {
        path: '^src/utils',
      },
      to: {
        path: '^(src/screens|src/components)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
