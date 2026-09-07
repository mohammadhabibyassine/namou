import {
  isDemoEditorialImage,
  ProductArtwork,
} from "@/components/commerce/product-artwork";
import { ProductImage } from "@/components/commerce/product-image";
import { publicEnvironment } from "@/config/env.client";
import { cn } from "@/lib/utils/cn";

function isAllowedSource(src: string | null): src is string {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  if (!publicEnvironment.productImageOrigin) return false;
  try {
    const source = new URL(src);
    return (
      source.origin === publicEnvironment.productImageOrigin &&
      source.pathname.startsWith("/products/") &&
      !source.search &&
      !source.username &&
      !source.password
    );
  } catch {
    return false;
  }
}

export function ProductMedia({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  slug,
  category,
  detailed = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  slug?: string;
  category?: string;
  detailed?: boolean;
}) {
  if (slug && isDemoEditorialImage(src)) {
    return (
      <ProductArtwork
        slug={slug}
        title={alt}
        category={category}
        detailed={detailed}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn("relative isolate overflow-hidden bg-[#deddd9]", className)}
    >
      {isAllowedSource(src) ? (
        <ProductImage
          key={src}
          src={src}
          alt={alt}
          sizes={sizes}
          priority={priority}
          className="group-hover:scale-[1.025]"
        />
      ) : (
        <div
          className="technical-grid absolute inset-0 grid place-items-center"
          role="img"
          aria-label={`${alt} image unavailable`}
        >
          <div className="relative h-[58%] w-[50%] rounded-[44%_44%_30%_30%] bg-gradient-to-br from-[#333735] via-[#111313] to-[#4c504c] shadow-[0_24px_42px_rgb(0_0_0/0.2)] before:absolute before:inset-x-[18%] before:top-[10%] before:h-[22%] before:rounded-[50%] before:border before:border-white/15 after:absolute after:inset-x-[12%] after:bottom-[12%] after:h-px after:bg-white/15" />
          <span className="text-subtle absolute bottom-4 font-mono text-[9px] uppercase">
            Image pending / Namou object
          </span>
        </div>
      )}
    </div>
  );
}
