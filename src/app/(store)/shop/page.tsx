import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogResults } from "@/components/catalog/catalog-results";
import { catalogServerApi } from "@/features/catalog/api.server";
import type { ProductFilters } from "@/features/catalog/types";

export const metadata: Metadata = {
  title: "Shop all objects",
  description:
    "Browse Namou technical fashion, modular carry, footwear, and objects.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const query = await searchParams;
  const categoryId = one(query.categoryId);
  const search = one(query.search);
  const minPrice = one(query.minPrice);
  const maxPrice = one(query.maxPrice);
  const cursor = one(query.cursor);
  const filters: ProductFilters = {
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { search } : {}),
    attributeValueIds: Array.isArray(query.attributeValueIds)
      ? query.attributeValueIds
      : query.attributeValueIds
        ? [query.attributeValueIds]
        : [],
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    currencyCode: "USD",
    sort:
      (["newest", "price_asc", "price_desc", "relevance"] as const).find(
        (value) => value === one(query.sort),
      ) ?? "newest",
    ...(cursor ? { cursor } : {}),
    pageSize: 12,
  };
  const [productsResult, categoriesResult, facetsResult] =
    await Promise.allSettled([
      catalogServerApi.products(filters),
      catalogServerApi.categories(),
      catalogServerApi.facets({
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.currencyCode ? { currencyCode: filters.currencyCode } : {}),
      }),
    ]);
  const page =
    productsResult.status === "fulfilled" ? productsResult.value : null;
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const facets =
    facetsResult.status === "fulfilled" ? facetsResult.value : null;
  return (
    <div className="namou-container py-7 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        <div className="border-line col-span-full grid gap-4 border-b pb-7 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="technical-label text-subtle mb-3">
              Shop / All systems
            </p>
            <h1 className="display-title text-6xl sm:text-8xl lg:text-9xl">
              All objects
            </h1>
          </div>
          <p className="text-subtle max-w-xl text-sm leading-6 md:justify-self-end">
            Objects engineered for movement. Built with utility, shaped by edge,
            and designed to adapt.
          </p>
        </div>
        <CatalogFilters
          categories={categories}
          facets={facets}
          filters={filters}
        />
        <section aria-label="Product results">
          {page ? (
            <>
              {page.items.length ? (
                <CatalogResults initialPage={page} filters={filters} />
              ) : (
                <div className="hairline-panel grid min-h-96 place-items-center p-8 text-center">
                  <div>
                    <p className="display-title text-5xl">Nothing matched.</p>
                    <p className="text-subtle mt-3 text-sm">
                      Clear a filter or search a different system.
                    </p>
                    <Link
                      href="/shop"
                      className="bg-acid mt-6 inline-block rounded-lg px-5 py-3 font-mono text-[10px] uppercase"
                    >
                      Clear filters
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="hairline-panel technical-grid grid min-h-[32rem] place-items-center p-8 text-center">
              <div>
                <p className="display-title text-6xl">
                  Connection interrupted.
                </p>
                <p className="text-subtle mt-4 max-w-md text-sm">
                  The product system could not be reached. Your filters are
                  intact—try again when the backend is available.
                </p>
                <Link
                  href="/shop"
                  className="bg-acid mt-6 inline-block rounded-lg px-5 py-3 font-mono text-[10px] uppercase"
                >
                  Retry system
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
