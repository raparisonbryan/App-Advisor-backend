module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.js",
    "<rootDir>/tests/mocks-setup.js",
  ],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "Controllers/**/*.js",
    "Models/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**",
    "!**/tests/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  automock: false,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {},
  moduleFileExtensions: ["js", "json"],
  testFailureExitCode: 1,
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  silent: false,
  verbose: false,
};
