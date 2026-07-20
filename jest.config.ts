import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  // next-intl/use-intl/@formatjs ship ESM-only builds; without this carve-out
  // Jest's default node_modules exclusion leaves them untranspiled and the
  // "export" syntax breaks the CommonJS test runtime.
  transformIgnorePatterns: [
    "/node_modules/(?!(next-intl|use-intl|@formatjs|intl-messageformat|icu-minify|tslib)/)",
  ],
};

export default createJestConfig(config);
