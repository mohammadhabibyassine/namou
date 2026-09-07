import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import { CatalogResults } from "@/components/catalog/catalog-results";
import { catalogServerApi } from "@/features/catalog/api.server";
import type { ProductFilters } from "@/features/catalog/types";

export const metadata: Metadata = {
  title: "Drops | Namou",
  description: "Explore the latest releases and drops from Namou.",
};

export default async function DropsPage() {
  const filters: ProductFilters = {
    sort: "newest",
    pageSize: 24,
    currencyCode: "USD",
  };
  const productsResult = await catalogServerApi
    .products(filters)
    .catch(() => null);

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
        {productsResult?.items.length ? (
          <CatalogResults initialPage={productsResult} filters={filters} />
        ) : (
          <div className="hairline-panel p-12 text-center">
            <Layers className="text-subtle mx-auto" size={28} />
            <h3 className="display-title text-ink mt-3 text-3xl">
              No drops available
            </h3>
            <Link
              href="/shop"
              className="action-button mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-5 font-mono text-[9px] font-bold tracking-wider uppercase"
            >
              Browse Shop
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
