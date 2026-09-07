"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, X } from "lucide-react";
import { Price } from "@/components/commerce/price";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  isDemoEditorialImage,
  ProductArtwork,
} from "@/components/commerce/product-artwork";
import { ProductMedia } from "@/components/commerce/product-media";
import { catalogClientApi } from "@/features/catalog/api.client";
import { useDebounce } from "@/hooks/common/useDebounce";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils/cn";

const suggestions = ["Technical jacket", "Motion", "Carry", "Wearable"];

export function StoreSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 220);
  const results = useQuery({
    queryKey: queryKeys.products.page({
      search: debouncedQuery,
      sort: "relevance",
      pageSize: 6,
    }),
    queryFn: () =>
      catalogClientApi.products({
        search: debouncedQuery,
        sort: "relevance",
        pageSize: 6,
      }),
    enabled: open && debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 60);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  function submitSearch(value = query) {
    const normalized = value.trim();
    if (!normalized) return;
    onClose();
    router.push(
      `/shop?search=${encodeURIComponent(normalized)}&sort=relevance`,
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] transition-[visibility,opacity] duration-200",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close product search"
        tabIndex={open ? 0 : -1}
      />
      <section
        id="namou-search-system"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-system-title"
        className={cn(
          "bg-background absolute inset-x-0 top-0 max-h-[92dvh] overflow-y-auto border-b border-black/10 shadow-[0_30px_90px_rgb(0_0_0/.28)] transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "-translate-y-6",
        )}
      >
        <div className="namou-container py-5 sm:py-8">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="technical-label text-subtle">
                Object finder / Live index
              </p>
              <h2
                id="search-system-title"
                className="display-title mt-2 text-5xl sm:text-7xl"
              >
                Search the system
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border-line bg-surface grid size-11 shrink-0 place-items-center rounded-full border transition-transform active:scale-90 motion-safe:hover:rotate-90"
              aria-label="Close search"
            >
              <X size={19} />
            </button>
          </div>

          <form
            className="border-line relative mt-6 border-y"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <Search
              className="absolute top-1/2 left-0 -translate-y-1/2"
              size={23}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="TYPE AN OBJECT, CATEGORY, OR SYSTEM…"
              autoComplete="off"
              maxLength={200}
              tabIndex={open ? 0 : -1}
              className="h-20 w-full bg-transparent pr-28 pl-10 font-mono text-sm uppercase outline-none placeholder:text-black/35 sm:h-24 sm:text-xl"
              aria-label="Search products"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="action-button absolute top-1/2 right-0 flex min-h-11 -translate-y-1/2 items-center gap-3 rounded-lg px-4 font-mono text-[10px] uppercase"
            >
              Search <ArrowRight size={14} />
            </button>
          </form>

          {debouncedQuery.length < 2 ? (
            <div className="grid gap-6 py-7 sm:grid-cols-[1fr_2fr] sm:items-start">
              <p className="technical-label text-subtle">Suggested vectors</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="border-line bg-surface hover:border-signal hover:bg-signal hover:text-signal-foreground rounded-full border px-4 py-2 font-mono text-[10px] uppercase transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : results.isPending || debouncedQuery !== query.trim() ? (
            <div className="grid min-h-48 place-items-center" role="status">
              <div className="text-center">
                <LoadingSpinner className="mx-auto" size="md" />
                <p className="technical-label text-subtle mt-3">
                  Scanning objects
                </p>
              </div>
            </div>
          ) : results.isError ? (
            <div className="py-10">
              <p className="display-title text-4xl">Search link interrupted.</p>
              <p className="text-subtle mt-2 text-sm">
                The catalog is still available from the shop.
              </p>
            </div>
          ) : results.data.items.length ? (
            <div className="py-6">
              <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase">
                <span>{results.data.items.length} objects located</span>
                <span className="text-subtle">Enter to view full index</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {results.data.items.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="group border-line bg-surface overflow-hidden border transition-[transform,box-shadow] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg"
                  >
                    {isDemoEditorialImage(product.primaryImageUrl) ? (
                      <ProductArtwork
                        slug={product.slug}
                        title={product.title}
                        category={product.category.name}
                        className="aspect-[4/3]"
                      />
                    ) : (
                      <ProductMedia
                        src={product.primaryImageUrl}
                        alt={product.title}
                        className="aspect-[4/3]"
                      />
                    )}
                    <div className="border-line border-t p-3">
                      <p className="truncate font-mono text-[10px] font-semibold uppercase">
                        {product.title}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-subtle truncate font-mono text-[8px] uppercase">
                          {product.category.name}
                        </span>
                        <Price
                          amount={product.minimumPrice}
                          currencyCode={product.currencyCode}
                          className="text-[9px]"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => submitSearch(debouncedQuery)}
                className="border-line hover:border-signal hover:bg-signal hover:text-signal-foreground mt-4 flex min-h-11 w-full items-center justify-center gap-4 border font-mono text-[10px] uppercase transition-colors"
              >
                View all matching objects <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="display-title text-5xl">
                No object on this vector.
              </p>
              <p className="text-subtle mt-2 text-sm">
                Try a broader name or browse all objects.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
