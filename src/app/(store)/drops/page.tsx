import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { catalogServerApi } from "@/features/catalog/api.server";

export const metadata: Metadata = {
  title: "Drops | Namou",
  description: "Explore the latest releases and drops from Namou.",
};

export default async function DropsPage() {
  const productsResult = await catalogServerApi
    .products({
      sort: "newest",
      pageSize: 24,
      currencyCode: "USD",
    })
    .catch(() => null);

  const products = productsResult?.items ?? [];

  return (
    <div className="namou-container py-7 sm:py-12">
      {/* Clean Header */}
      <header className="border-line border-b pb-6 sm:pb-8">
        <p className="technical-label text-subtle">Releases / Newest</p>
        <h1 className="display-title mt-2 text-6xl sm:text-8xl lg:text-9xl">
          Drops
        </h1>
      </header>

      {/* Product Results */}
      <section className="mt-8 sm:mt-10" aria-label="Drop releases">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="hairline-panel p-12 text-center">
            <Layers className="text-subtle mx-auto" size={28} />
            <h3 className="display-title text-ink mt-3 text-3xl">
              No drops available
            </h3>
            <Link
              href="/shop"
              className="bg-acid mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-5 font-mono text-[9px] font-bold tracking-wider text-black uppercase hover:opacity-90"
            >
              Browse Shop
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
