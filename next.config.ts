import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const productImageOrigin = process.env.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN
  ? new URL(process.env.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN)
  : null;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  ...(productImageOrigin
    ? {
        images: {
          remotePatterns: [
            {
              protocol: productImageOrigin.protocol.replace(":", "") as
                "http" | "https",
              hostname: productImageOrigin.hostname,
              port: productImageOrigin.port,
              pathname: "/**",
            },
          ],
        },
      }
    : {}),
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
