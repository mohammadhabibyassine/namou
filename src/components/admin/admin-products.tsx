"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductMedia } from "@/components/commerce/product-media";
import { Price } from "@/components/commerce/price";
import { CursorPagination } from "@/components/ui/cursor-pagination";
import { catalogClientApi } from "@/features/catalog/api.client";
import { queryKeys } from "@/lib/query/keys";

export function AdminProducts() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.admin.products,
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      catalogClientApi.products({
        sort: "newest",
        pageSize: 10,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
  });
  const products = query.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <div className="p-4 sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="technical-label text-subtle">
            Catalog / Active objects
          </p>
          <h1 className="display-title mt-2 text-6xl sm:text-8xl">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-acid inline-flex min-h-11 items-center gap-3 rounded-lg px-4 font-mono text-[9px] uppercase"
        >
          <Plus size={14} /> Create product
        </Link>
      </div>
      <div className="mt-7 rounded-xl border border-[#ded3a7] bg-[#f6f0d8] p-3 font-mono text-[8px] text-[#765b00] uppercase">
        The current backend exposes only the public active catalog as a product
        index. Inactive and deleted products require a future admin list
        endpoint.
      </div>
      <section className="hairline-panel mt-4 overflow-hidden">
        {query.isPending ? (
          <div className="bg-muted h-80 animate-pulse" />
        ) : query.isError ? (
          <p className="text-danger p-8 text-center text-sm">
            Products could not be loaded.
          </p>
        ) : products.length ? (
          <div className="divide-line divide-y">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 p-3 sm:grid-cols-[4rem_1.2fr_.7fr_.7fr_auto]"
              >
                <ProductMedia
                  src={product.primaryImageUrl}
                  alt={product.title}
                  slug={product.slug}
                  category={product.category.name}
                  className="aspect-square rounded-lg"
                  sizes="64px"
                />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[10px] font-semibold uppercase">
                    {product.title}
                  </p>
                  <p className="text-subtle mt-1 font-mono text-[8px] uppercase">
                    {product.slug}
                  </p>
                </div>
                <p className="hidden font-mono text-[9px] uppercase sm:block">
                  {product.category.name}
                </p>
                <div className="hidden sm:block">
                  <Price
                    amount={product.minimumPrice}
                    currencyCode={product.currencyCode}
                    className="text-[9px]"
                  />
                  <p className="text-subtle mt-1 font-mono text-[8px] uppercase">
                    {product.inStock ? "In stock" : "Out of stock"}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="bg-ink inline-flex min-h-9 items-center gap-4 rounded-lg px-4 font-mono text-[9px] text-white uppercase"
                >
                  Variants <ArrowRight size={13} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-subtle p-8 text-center text-sm">
            No active products.
          </p>
        )}
      </section>
      <CursorPagination
        totalLoaded={products.length}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={() => query.fetchNextPage()}
        noun="products"
      />
    </div>
  );
}
