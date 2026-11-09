import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@careerproof/reference-data", "@careerproof/career-graph", "@careerproof/rules-engine", "@careerproof/db", "@careerproof/sample-data"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
