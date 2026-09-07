import type { MetadataRoute } from "next";
import { serverEnvironment } from "@/config/env.server";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop/"],
        disallow: [
          "/api/",
          "/account/",
          "/checkout/",
          "/orders/",
          "/order-confirmation/",
          "/admin/",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", serverEnvironment.SITE_URL).toString(),
  };
}
