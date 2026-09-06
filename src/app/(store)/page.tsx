import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/home/home-hero";
import { ProductCard } from "@/components/commerce/product-card";
import { SectionHeading } from "@/components/layout/section-heading";
import { catalogServerApi } from "@/features/catalog/api.server";

export const revalidate = 60;

export default async function HomePage() {
  const [productsResult, categoriesResult] = await Promise.allSettled([
    catalogServerApi.products({ sort: "newest", pageSize: 8 }),
    catalogServerApi.categories(),
  ]);
  const products =
    productsResult.status === "fulfilled" ? productsResult.value.items : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  return (
    <>
      <HomeHero />
      <section
        className="namou-container mt-5"
        aria-labelledby="new-arrivals-title"
      >
        <div
          className="hide-scrollbar flex gap-2 overflow-x-auto pb-4"
          id="categories"
        >
          <Link
            href="/shop"
            className="bg-ink shrink-0 rounded-lg px-6 py-3 font-mono text-[10px] text-white uppercase"
          >
            <span className="text-acid mr-3">●</span>New arrivals
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${category.id}`}
              className="bg-muted hover:bg-line shrink-0 rounded-lg px-7 py-3 font-mono text-[10px] uppercase transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <div className="sr-only">
          <h2 id="new-arrivals-title">New arrivals</h2>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {products.slice(0, 4).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="hairline-panel technical-grid grid min-h-52 place-items-center p-8 text-center">
            <div>
              <p className="font-mono text-xs uppercase">
                New objects are moving into position.
              </p>
              <p className="text-subtle mt-2 text-sm">
                The catalog will appear as soon as the product service is
                available.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="namou-container border-line mt-20 grid gap-8 border-y py-12 md:grid-cols-[.7fr_1.3fr] md:items-end">
        <SectionHeading
          eyebrow="Namou field notes / 02"
          title="Utility without uniformity."
        />
        <div className="md:pl-10">
          <p className="text-subtle max-w-2xl text-lg leading-8">
            Every piece is designed as part of a modular system: adaptable
            layers, deliberate storage, and technical objects with enough
            character to move beyond the expected.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-5 font-mono text-xs uppercase"
          >
            Enter the system <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
