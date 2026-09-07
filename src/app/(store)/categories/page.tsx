import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderTree } from "lucide-react";
import { catalogServerApi } from "@/features/catalog/api.server";

export const metadata: Metadata = {
  title: "Categories | Namou",
  description: "Browse Namou products by category.",
};

export default async function CategoriesPage() {
  const tree = await catalogServerApi.categories().catch(() => []);

  return (
    <div className="namou-container py-7 sm:py-12">
      {/* Clean Header */}
      <header className="border-line border-b pb-6 sm:pb-8">
        <p className="technical-label text-subtle">Catalog / Categories</p>
        <h1 className="display-title mt-2 text-6xl sm:text-8xl lg:text-9xl">
          Categories
        </h1>
      </header>

      {/* Category Cards */}
      <section className="mt-8 sm:mt-10" aria-label="Product categories">
        {tree.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tree.map((category) => {
              const hasChildren =
                category.children && category.children.length > 0;
              return (
                <article
                  key={category.id}
                  className="hairline-panel group flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <h2 className="display-title text-ink text-4xl sm:text-5xl">
                      {category.name}
                    </h2>

                    {category.description ? (
                      <p className="text-subtle mt-2 text-xs leading-relaxed">
                        {category.description}
                      </p>
                    ) : null}

                    {/* Subcategories */}
                    {hasChildren ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/shop?categoryId=${child.id}`}
                            className="border-line bg-surface text-ink rounded-md border px-2.5 py-1 font-mono text-[9px] tracking-wider uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="border-line mt-6 border-t pt-4">
                    <Link
                      href={`/shop?categoryId=${category.id}`}
                      className="text-ink inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider uppercase group-hover:text-black"
                    >
                      <span>Browse {category.name}</span>
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="hairline-panel p-12 text-center">
            <FolderTree className="text-subtle mx-auto" size={28} />
            <h3 className="display-title text-ink mt-3 text-3xl">
              No categories found
            </h3>
            <Link
              href="/shop"
              className="action-button mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-5 font-mono text-[9px] font-bold tracking-wider uppercase"
            >
              Go to Shop
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
