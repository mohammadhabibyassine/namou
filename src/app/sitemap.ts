import type { MetadataRoute } from "next";
import { serverEnvironment } from "@/config/env.server";
import { catalogServerApi } from "@/features/catalog/api.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverEnvironment.SITE_URL;
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: new URL("/", base).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/shop", base).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
  try {
    const products = await catalogServerApi.products({
      sort: "newest",
      pageSize: 50,
    });
    return [
      ...staticRoutes,
      ...products.items.map((product) => ({
        url: new URL(`/shop/${product.slug}`, base).toString(),
        lastModified: product.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
