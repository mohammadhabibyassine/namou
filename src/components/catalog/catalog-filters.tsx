import Link from "next/link";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import type { CategoryTreeNode, ProductCatalogFacets } from "@/types/api";
import type { ProductFilters } from "@/features/catalog/types";

function CategoryOptions({
  nodes,
  activeId,
  name = "categoryId",
}: {
  nodes: CategoryTreeNode[];
  activeId: string | undefined;
  name?: string;
}) {
  return nodes.map((node) => (
    <div key={node.id}>
      <label className="flex cursor-pointer items-center gap-2 py-1.5 font-mono text-[10px] uppercase">
        <input
          type="radio"
          name={name}
          value={node.id}
          defaultChecked={node.id === activeId}
          className="size-3.5 accent-black"
        />
        {node.name}
      </label>
      {node.children.length ? (
        <div className="border-line ml-4 border-l pl-3">
          <CategoryOptions
            nodes={node.children}
            activeId={activeId}
            name={name}
          />
        </div>
      ) : null}
    </div>
  ));
}

function findCategory(nodes: CategoryTreeNode[], id: string): string | null {
  for (const node of nodes) {
    if (node.id === id) return node.name;
    const child = findCategory(node.children, id);
    if (child) return child;
  }
  return null;
}

function filterHref(
  filters: ProductFilters,
  remove: { type: "category" | "attribute" | "price" | "search"; id?: string },
): string {
  const params = new URLSearchParams();
  if (filters.sort && filters.sort !== "newest")
    params.set("sort", filters.sort);
  if (filters.categoryId && remove.type !== "category") {
    params.set("categoryId", filters.categoryId);
  }
  if (filters.search && remove.type !== "search")
    params.set("search", filters.search);
  if (remove.type !== "price") {
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  }
  for (const value of filters.attributeValueIds ?? []) {
    if (remove.type !== "attribute" || remove.id !== value) {
      params.append("attributeValueIds", value);
    }
  }
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

function PreservedFilterInputs({ filters }: { filters: ProductFilters }) {
  return (
    <>
      {filters.categoryId ? (
        <input type="hidden" name="categoryId" value={filters.categoryId} />
      ) : null}
      {filters.search ? (
        <input type="hidden" name="search" value={filters.search} />
      ) : null}
      {filters.minPrice ? (
        <input type="hidden" name="minPrice" value={filters.minPrice} />
      ) : null}
      {filters.maxPrice ? (
        <input type="hidden" name="maxPrice" value={filters.maxPrice} />
      ) : null}
      {(filters.attributeValueIds ?? []).map((value) => (
        <input
          key={value}
          type="hidden"
          name="attributeValueIds"
          value={value}
        />
      ))}
    </>
  );
}

function FilterFields({
  categories,
  facets,
  filters,
}: {
  categories: CategoryTreeNode[];
  facets: ProductCatalogFacets | null;
  filters: ProductFilters;
}) {
  return (
    <>
      <input type="hidden" name="sort" value={filters.sort ?? "newest"} />
      {filters.search ? (
        <input type="hidden" name="search" value={filters.search} />
      ) : null}
      <div>
        <h2 className="technical-label mb-3 font-semibold">Category</h2>
        <label className="flex cursor-pointer items-center gap-2 py-1.5 font-mono text-[10px] uppercase">
          <input
            type="radio"
            name="categoryId"
            value=""
            defaultChecked={!filters.categoryId}
            className="size-3.5 accent-black"
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
              className="border-line h-11 w-full border bg-transparent px-3 font-mono text-[10px] outline-none focus:border-black"
            />
          </label>
          <label>
            <span className="sr-only">Maximum price</span>
            <input
              name="maxPrice"
              inputMode="decimal"
              defaultValue={filters.maxPrice}
              placeholder="MAX"
              className="border-line h-11 w-full border bg-transparent px-3 font-mono text-[10px] outline-none focus:border-black"
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
                  defaultChecked={filters.attributeValueIds?.includes(value.id)}
                  className="size-3.5 accent-black"
                />
                {value.value}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
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
  const active = [
    ...(filters.search
      ? [
          {
            label: `Search: ${filters.search}`,
            href: filterHref(filters, { type: "search" }),
          },
        ]
      : []),
    ...(filters.categoryId
      ? [
          {
            label: `Category: ${findCategory(categories, filters.categoryId) ?? "Selected"}`,
            href: filterHref(filters, { type: "category" }),
          },
        ]
      : []),
    ...((filters.attributeValueIds ?? []).map((id) => {
      const match = facets?.attributes
        .flatMap((attribute) =>
          attribute.values.map((value) => ({
            attribute: attribute.name,
            id: value.id,
            value: value.value,
          })),
        )
        .find((value) => value.id === id);
      return {
        label: match
          ? `${match.attribute}: ${match.value}`
          : "Selected attribute",
        href: filterHref(filters, { type: "attribute", id }),
      };
    }) ?? []),
    ...(filters.minPrice || filters.maxPrice
      ? [
          {
            label: `$${filters.minPrice ?? "0"}–$${filters.maxPrice ?? "∞"}`,
            href: filterHref(filters, { type: "price" }),
          },
        ]
      : []),
  ];

  return (
    <>
      <form
        action="/shop"
        id="catalog-filters"
        className="border-line col-span-full flex min-h-14 flex-wrap items-center gap-3 border-y py-2"
      >
        <a
          href="#catalog-filter-panel"
          className="flex min-w-44 items-center gap-3 pr-5 font-mono text-xs font-semibold uppercase lg:border-r lg:border-black/10"
        >
          Filter <SlidersHorizontal size={15} />
        </a>
        <div className="hide-scrollbar order-3 flex w-full flex-1 gap-2 overflow-x-auto lg:order-none lg:w-auto">
          {active.length ? (
            active.map((filter) => (
              <Link
                key={`${filter.label}:${filter.href}`}
                href={filter.href}
                className="action-button inline-flex shrink-0 items-center gap-2 px-3 py-2 font-mono text-[9px] font-semibold uppercase"
              >
                {filter.label} <X size={12} />
              </Link>
            ))
          ) : (
            <span className="text-subtle hidden font-mono text-[9px] uppercase sm:inline">
              All systems active
            </span>
          )}
        </div>
        <PreservedFilterInputs filters={filters} />
        <label className="ml-auto flex shrink-0 items-center gap-2">
          <span className="technical-label">Sort</span>
          <select
            name="sort"
            defaultValue={filters.sort ?? "newest"}
            className="h-10 bg-transparent px-2 font-mono text-[10px] font-semibold uppercase outline-none"
          >
            <option value="newest">Newest ↓</option>
            <option value="price_asc">Price: low</option>
            <option value="price_desc">Price: high</option>
            <option value="relevance">Relevance</option>
          </select>
        </label>
        <button
          className="bg-ink grid size-9 place-items-center rounded-full text-white transition-transform active:scale-90"
          aria-label="Apply sort"
        >
          <ArrowRight size={14} />
        </button>
      </form>

      <aside
        id="catalog-filter-panel"
        className="border-line hidden border-r pr-6 lg:block"
        aria-label="Product filters"
      >
        <form action="/shop" className="sticky top-24 space-y-7 py-2">
          <FilterFields
            categories={categories}
            facets={facets}
            filters={filters}
          />
          <button className="action-button h-11 w-full font-mono text-[10px] uppercase">
            Apply filters
          </button>
          <Link
            href="/shop"
            className="block text-center font-mono text-[9px] uppercase underline underline-offset-4"
          >
            Clear all
          </Link>
        </form>
      </aside>

      <details className="border-line bg-surface col-span-full border lg:hidden">
        <summary className="px-4 py-4 font-mono text-[10px] uppercase">
          Category & attribute filters
        </summary>
        <form action="/shop" className="space-y-6 border-t border-black/10 p-4">
          <FilterFields
            categories={categories}
            facets={facets}
            filters={filters}
          />
          <button className="action-button h-12 w-full font-mono text-[10px] font-semibold uppercase">
            Apply filters
          </button>
          <Link
            href="/shop"
            className="block text-center font-mono text-[9px] uppercase underline underline-offset-4"
          >
            Clear all
          </Link>
        </form>
      </details>
    </>
  );
}
