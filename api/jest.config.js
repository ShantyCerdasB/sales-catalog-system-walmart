module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  testTimeout: 140_000,
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/test/integration/**/*.spec.ts',
    '<rootDir>/src/test/unit/**/*.spec.ts'
  ],

  setupFilesAfterEnv: [
    '<rootDir>/src/test/jest.setup.ts',
  ],
};
