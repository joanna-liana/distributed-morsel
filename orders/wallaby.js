module.exports = function (_wallaby) {
  return {
    files: ['src/**/*.ts', '!src/**/*spec.ts'],

    tests: ['src/**/*spec.ts'],

    testFramework: 'jest',

    env: {
      type: 'node',
      runner: 'node',
    },

    autoDetect: true,
  };
};
