"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAddToCart } from "@/hooks/cart";
import { catalogClientApi } from "@/features/catalog/api.client";
import { announceCommerceFeedback } from "@/lib/commerce/feedback";
import { queryKeys } from "@/lib/query/keys";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import type { ProductListItem } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export function ProductQuickAdd({
  product,
  className,
}: {
  product: ProductListItem;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");
  const queryClient = useQueryClient();
  const { authenticated } = useSession();
  const addServerCart = useAddToCart();
  const addGuestCart = useGuestCommerce((store) => store.addCartItem);

  useEffect(() => {
    if (state !== "added") return;
    const timer = setTimeout(() => setState("idle"), 1700);
    return () => clearTimeout(timer);
  }, [state]);

  async function quickAdd() {
    if (state === "loading") return;
    setState("loading");
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: queryKeys.products.detail(product.slug),
        queryFn: () => catalogClientApi.product(product.slug),
        staleTime: 60_000,
      });
      const variant =
        detail.variants.find(
          (candidate) => candidate.isDefault && candidate.stockQuantity > 0,
        ) ?? detail.variants.find((candidate) => candidate.stockQuantity > 0);
      if (!variant) throw new Error("No available configuration");

      if (authenticated) {
        await addServerCart.mutateAsync({ variantId: variant.id, quantity: 1 });
      } else {
        addGuestCart(
          {
            variantId: variant.id,
            productId: detail.id,
            title: detail.title,
            slug: detail.slug,
            imageUrl: product.primaryImageUrl ?? null,
            sku: variant.sku,
            options: variant.options.map((option) => ({
              attributeType: option.attributeTypeName,
              value: option.value,
            })),
            unitPrice: variant.effectivePrice,
            currencyCode: detail.currencyCode,
          },
          1,
        );
      }
      setState("added");
      announceCommerceFeedback({
        message: "Added to cart",
        detail: `${product.title} · ${variant.options.map((option) => option.value).join(" / ") || "Standard"}`,
        tone: "success",
        target: "cart",
      });
    } catch {
      setState("idle");
      announceCommerceFeedback({
        message: "Quick add interrupted",
        detail: "Open the object to review its available configuration.",
        tone: "error",
        target: "cart",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={quickAdd}
      disabled={!product.inStock || state === "loading"}
      className={cn(
        "bg-ink text-acid grid size-10 shrink-0 place-items-center rounded-lg transition-[transform,background-color,color] active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 motion-safe:hover:scale-105",
        state === "added" && "action-button",
        className,
      )}
      aria-label={
        !product.inStock
          ? `${product.title} is unavailable`
          : state === "added"
            ? `${product.title} added to cart`
            : `Quick add ${product.title} to cart`
      }
    >
      {state === "loading" ? (
        <LoadingSpinner size="sm" />
      ) : state === "added" ? (
        <Check size={17} aria-hidden="true" />
      ) : (
        <Plus size={18} aria-hidden="true" />
      )}
    </button>
  );
}
