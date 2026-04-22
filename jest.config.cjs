/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        diagnostics: {
          ignoreCodes: [151002]
        }
      },
    ],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.archive/'
  ],
  modulePathIgnorePatterns: [
    '/.archive/'
  ]
};