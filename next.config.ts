import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,

  // The site lives at projects.vedantshukla.in/lobster. The hub project rewrites that path here.
  basePath: "/lobster",

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async redirects() {
    // Someone opening this deployment's own URL at "/" lands on the site.
    return [{ source: "/", destination: "/lobster", basePath: false, permanent: false }];
  },
};

export default nextConfig;