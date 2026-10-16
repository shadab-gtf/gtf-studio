import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"] },
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // PptxGenJS declares browser fallbacks for these built-ins. Webpack needs
      // the node: prefix normalized before it applies those browser mappings.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:(fs|https)$/,
          (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, "");
          },
        ),
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
