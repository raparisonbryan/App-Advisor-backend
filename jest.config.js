module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  setupFiles: ["<rootDir>/tests/mocks-setup.js"],
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
  // Configuration des mocks automatiques
  automock: false,
  // Configuration des mocks manuels
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Configuration des transformateurs
  transform: {},
  // Configuration des extensions
  moduleFileExtensions: ["js", "json"],
  // Configuration pour que Jest échoue si les tests ne passent pas
  testFailureExitCode: 1,
  // Configuration pour la couverture
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  // Configuration pour échouer si la couverture est insuffisante
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
