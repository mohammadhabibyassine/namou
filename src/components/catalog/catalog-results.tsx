"use client";

import { ArrowDown } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/commerce/product-card";
import { catalogClientApi } from "@/features/catalog/api.client";
import type { ProductFilters } from "@/features/catalog/types";
import { queryKeys } from "@/lib/query/keys";
import type { CursorPage, ProductListItem } from "@/types/api";

export function CatalogResults({
  initialPage,
  filters,
}: {
  initialPage: CursorPage<ProductListItem>;
  filters: ProductFilters;
}) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.products.infinite(filters),
    initialPageParam: filters.cursor ?? "",
    initialData: {
      pages: [initialPage],
      pageParams: [filters.cursor ?? ""],
    },
    queryFn: ({ pageParam }) =>
      catalogClientApi.products({
        ...filters,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
  });
  const products = query.data.pages.flatMap((page) => page.items);
  return (
    <>
      <div className="text-subtle mb-3 flex items-center justify-between font-mono text-[9px] uppercase">
        <span>{products.length} objects loaded</span>
        <span>System / {filters.sort?.replace("_", " ")}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
      {query.hasNextPage ? (
        <div className="mt-8 text-center">
          <button
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="border-line bg-surface inline-flex min-h-11 items-center gap-5 rounded-lg border px-10 font-mono text-[10px] uppercase disabled:opacity-50"
          >
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
            <ArrowDown size={15} />
          </button>
        </div>
      ) : null}
    </>
  );
}
