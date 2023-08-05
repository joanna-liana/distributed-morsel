module.exports = function (_wallaby) {
  return {
    files: ['src/**/*.ts', '!src/**/*spec.ts'],

    tests: ['src/**/*spec.ts'],

    testFramework: 'jest',

    env: {
      type: 'node',
    },

    // this is what makes or breaks the config
    autoDetect: true,
  };
};
