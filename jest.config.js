/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  // Mock React Native modules
  moduleNameMapper: {
    "^expo-file-system/legacy$":
      "<rootDir>/src/__tests__/__mocks__/expo-file-system.ts",
    "^expo-sqlite$": "<rootDir>/src/__tests__/__mocks__/expo-sqlite.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
};
