import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next-intl/use-intl (and their ICU-formatting transitive deps) ship
  // ESM-only; transpilePackages both lets the Next build handle them and
  // (via next/jest, which mirrors this list) lets Jest transform them
  // instead of skipping all of node_modules.
  transpilePackages: [
    "next-intl",
    "use-intl",
    "intl-messageformat",
    "icu-minify",
    "@formatjs/fast-memoize",
    "@formatjs/icu-messageformat-parser",
    "@formatjs/icu-skeleton-parser",
  ],
};

export default nextConfig;
