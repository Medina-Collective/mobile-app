/** @type {import('jest-expo').JestExpoConfig} */
module.exports = {
  preset: 'jest-expo',

  // expo[^/]* matches expo, expo-router, expo-modules-core, expo-constants, etc.
  // @expo[^/]*/  matches @expo/vector-icons, @expo/cli, etc.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo[^/]*' +
      '|@expo[^/]*/' +
      '|react-navigation' +
      '|@react-navigation/' +
      '|@tanstack/' +
      '|zustand' +
      '|zod' +
      '|date-fns' +
      '|react-native-worklets' +
      '))',
  ],

  // Collect coverage from all source files — even untested ones.
  // This makes the threshold meaningful: missing tests = missing coverage.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    // Barrel/index files: just re-exports, no logic to test
    '!src/**/index.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // lcov        → consumed by SonarQube
  // text        → printed in terminal during CI
  // text-summary → one-line summary at the end
  coverageReporters: ['lcov', 'text', 'text-summary'],

  coverageDirectory: 'coverage',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@app-types/(.*)$': '<rootDir>/src/types/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
