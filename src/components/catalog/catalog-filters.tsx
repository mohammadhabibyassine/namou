import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CategoryTreeNode, ProductCatalogFacets } from "@/types/api";
import type { ProductFilters } from "@/features/catalog/types";

function CategoryOptions({
  nodes,
  activeId,
}: {
  nodes: CategoryTreeNode[];
  activeId: string | undefined;
}) {
  return nodes.map((node) => (
    <div key={node.id}>
      <label className="flex cursor-pointer items-center gap-2 py-1 font-mono text-[10px] uppercase">
        <input
          type="radio"
          name="categoryId"
          value={node.id}
          defaultChecked={node.id === activeId}
          className="accent-black"
        />
        {node.name}
      </label>
      {node.children.length ? (
        <div className="border-line ml-4 border-l pl-3">
          <CategoryOptions nodes={node.children} activeId={activeId} />
        </div>
      ) : null}
    </div>
  ));
}

export function CatalogFilters({
  categories,
  facets,
  filters,
}: {
  categories: CategoryTreeNode[];
  facets: ProductCatalogFacets | null;
  filters: ProductFilters;
}) {
  return (
    <form action="/shop" className="contents">
      <div className="border-line col-span-full flex flex-col gap-3 border-y py-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search products</span>
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2"
            size={16}
          />
          <input
            name="search"
            defaultValue={filters.search}
            maxLength={200}
            placeholder="SEARCH OBJECTS"
            className="border-line bg-surface focus:border-ink h-11 w-full rounded-lg border pr-4 pl-10 font-mono text-xs outline-none"
          />
        </label>
        <label className="flex shrink-0 items-center gap-3">
          <span className="technical-label">Sort</span>
          <select
            name="sort"
            defaultValue={filters.sort ?? "newest"}
            className="border-line bg-surface h-11 rounded-lg border px-4 font-mono text-[10px] uppercase"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low</option>
            <option value="price_desc">Price: high</option>
            <option value="relevance">Relevance</option>
          </select>
        </label>
        <button className="bg-acid inline-flex h-11 items-center justify-center gap-3 rounded-lg px-5 font-mono text-[10px] uppercase">
          <SlidersHorizontal size={15} />
          Apply system
        </button>
      </div>

      <aside
        className="border-line hidden border-r pr-5 lg:block"
        aria-label="Product filters"
      >
        <div className="sticky top-24 space-y-7 py-1">
          <div>
            <h2 className="technical-label mb-3 font-semibold">Category</h2>
            <label className="flex cursor-pointer items-center gap-2 py-1 font-mono text-[10px] uppercase">
              <input
                type="radio"
                name="categoryId"
                value=""
                defaultChecked={!filters.categoryId}
                className="accent-black"
              />
              All objects
            </label>
            <CategoryOptions nodes={categories} activeId={filters.categoryId} />
          </div>
          <div className="border-line border-t pt-5">
            <h2 className="technical-label mb-3 font-semibold">Price / USD</h2>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="sr-only">Minimum price</span>
                <input
                  name="minPrice"
                  inputMode="decimal"
                  defaultValue={filters.minPrice}
                  placeholder="MIN"
                  className="border-line h-10 w-full rounded-lg border bg-transparent px-3 font-mono text-[10px]"
                />
              </label>
              <label>
                <span className="sr-only">Maximum price</span>
                <input
                  name="maxPrice"
                  inputMode="decimal"
                  defaultValue={filters.maxPrice}
                  placeholder="MAX"
                  className="border-line h-10 w-full rounded-lg border bg-transparent px-3 font-mono text-[10px]"
                />
              </label>
            </div>
          </div>
          {facets?.attributes.map((attribute) => (
            <fieldset key={attribute.id} className="border-line border-t pt-5">
              <legend className="technical-label mb-3 font-semibold">
                {attribute.name}
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {attribute.values.map((value) => (
                  <label
                    key={value.id}
                    className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase"
                  >
                    <input
                      type="checkbox"
                      name="attributeValueIds"
                      value={value.id}
                      defaultChecked={filters.attributeValueIds?.includes(
                        value.id,
                      )}
                      className="accent-black"
                    />
                    {value.value}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button className="bg-ink h-11 w-full rounded-lg font-mono text-[10px] text-white uppercase">
            Apply filters
          </button>
          <Link
            href="/shop"
            className="block text-center font-mono text-[9px] uppercase underline underline-offset-4"
          >
            Clear all
          </Link>
        </div>
      </aside>

      <details className="border-line bg-surface col-span-full rounded-lg border p-4 lg:hidden">
        <summary className="cursor-pointer font-mono text-xs uppercase">
          Category & attribute filters
        </summary>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="technical-label mb-2">Category</legend>
            <CategoryOptions nodes={categories} activeId={filters.categoryId} />
          </fieldset>
          <div className="space-y-5">
            {facets?.attributes.map((attribute) => (
              <fieldset key={attribute.id}>
                <legend className="technical-label mb-2">
                  {attribute.name}
                </legend>
                <div className="flex flex-wrap gap-3">
                  {attribute.values.map((value) => (
                    <label
                      key={value.id}
                      className="font-mono text-[10px] uppercase"
                    >
                      <input
                        className="mr-2 accent-black"
                        type="checkbox"
                        name="attributeValueIds"
                        value={value.id}
                        defaultChecked={filters.attributeValueIds?.includes(
                          value.id,
                        )}
                      />
                      {value.value}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="bg-ink h-11 w-full rounded-lg font-mono text-[10px] text-white uppercase">
              Apply filters
            </button>
          </div>
        </div>
      </details>
    </form>
  );
}
