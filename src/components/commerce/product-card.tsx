import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductMedia } from "@/components/commerce/product-media";
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
        "group border-line bg-surface min-w-0 overflow-hidden rounded-xl border",
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
            className="aspect-[4/3]"
          />
        </Link>
        <ProductSaveButton product={product} />
      </div>
      <div className="border-line grid grid-cols-[1fr_auto] items-end gap-3 border-t p-3">
        <div className="min-w-0">
          <h2 className="truncate font-mono text-xs font-semibold uppercase">
            <Link href={`/shop/${product.slug}`}>{product.title}</Link>
          </h2>
          <div className="text-subtle mt-1 flex items-center justify-between gap-3 text-[9px]">
            <span className="truncate font-mono uppercase">
              {product.category.name}
            </span>
            <Price
              amount={product.minimumPrice}
              currencyCode={product.currencyCode}
              className="text-foreground shrink-0 text-[10px]"
            />
          </div>
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className="bg-ink text-acid grid size-9 shrink-0 place-items-center rounded-lg transition-transform motion-safe:hover:scale-105"
          aria-label={`Choose options for ${product.title}`}
        >
          <Plus size={18} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
