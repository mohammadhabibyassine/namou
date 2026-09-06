import Link from "next/link";
import { ProductMedia } from "@/components/commerce/product-media";
import { ProductQuickAdd } from "@/components/commerce/product-quick-add";
import { ProductSaveButton } from "@/components/commerce/product-save-button";
import { Price } from "@/components/commerce/price";
import type { ProductListItem } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: ProductListItem;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group border-line min-w-0 overflow-hidden rounded-lg border bg-[#e7e5df] transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_42px_rgb(0_0_0/.12)]",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/shop/${product.slug}`}
          aria-label={`View ${product.title}`}
        >
          <ProductMedia
            src={product.primaryImageUrl}
            alt={product.title}
            priority={priority}
            slug={product.slug}
            category={product.category.name}
            className="aspect-[4/3.55]"
          />
        </Link>
        <ProductSaveButton product={product} />
      </div>
      <div className="border-line grid grid-cols-[1fr_auto] items-end gap-3 border-t p-3 sm:p-4">
        <div className="min-w-0">
          <p className="text-subtle truncate font-mono text-[9px] tracking-wide uppercase">
            {product.category.name}
          </p>
          <h2 className="mt-1 truncate font-mono text-[11px] font-semibold uppercase sm:text-xs">
            <Link href={`/shop/${product.slug}`}>{product.title}</Link>
          </h2>
          <div className="mt-3 flex items-center justify-between gap-3 text-[9px]">
            <Price
              amount={product.minimumPrice}
              currencyCode={product.currencyCode}
              className="text-foreground shrink-0 text-[9px] sm:text-[10px]"
            />
            <span
              className={cn(
                "hidden font-mono text-[8px] uppercase sm:inline",
                product.inStock ? "text-[#087e5b]" : "text-subtle",
              )}
            >
              {product.inStock ? "● In stock" : "Out of stock"}
            </span>
          </div>
        </div>
        <ProductQuickAdd product={product} />
      </div>
    </article>
  );
}
