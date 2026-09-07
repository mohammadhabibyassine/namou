"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { ProductMedia } from "@/components/commerce/product-media";
import { Price } from "@/components/commerce/price";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAddToCart } from "@/hooks/cart";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/wishlist";
import { announceCommerceFeedback } from "@/lib/commerce/feedback";
import { clampQuantity } from "@/lib/commerce/quantity";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import type { ProductDetail, ProductVariant } from "@/types/api";
import { cn } from "@/lib/utils/cn";

function optionMap(variant: ProductVariant) {
  return Object.fromEntries(
    variant.options.map((option) => [
      option.attributeTypeId,
      option.attributeValueId,
    ]),
  );
}

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const defaultVariant =
    product.variants.find((variant) => variant.isDefault) ??
    product.variants[0] ??
    null;
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    defaultVariant ? optionMap(defaultVariant) : {},
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [flying, setFlying] = useState(false);
  const { authenticated } = useSession();
  const addToServerCart = useAddToCart();
  const addToServerWishlist = useAddToWishlist();
  const removeFromServerWishlist = useRemoveFromWishlist();
  const wishlist = useWishlist({ pageSize: 100 }, { enabled: authenticated });
  const addGuestCartItem = useGuestCommerce((state) => state.addCartItem);
  const guestWishlistItems = useGuestCommerce((state) => state.wishlistItems);
  const toggleGuestWishlistItem = useGuestCommerce(
    (state) => state.toggleWishlistItem,
  );

  const variant = useMemo(
    () =>
      product.variants.find((candidate) =>
        candidate.options.every(
          (option) =>
            selected[option.attributeTypeId] === option.attributeValueId,
        ),
      ) ?? defaultVariant,
    [defaultVariant, product.variants, selected],
  );
  const images = useMemo(() => {
    const selectedImages = variant
      ? product.images.filter((image) => image.variantId === variant.id)
      : [];
    const general = product.images.filter((image) => image.variantId === null);
    return selectedImages.length
      ? [...selectedImages, ...general]
      : general.length
        ? general
        : product.images;
  }, [product.images, variant]);
  const activeImage = images[imageIndex % Math.max(images.length, 1)] ?? null;
  const stockQuantity = variant?.stockQuantity ?? 0;
  const maxQuantity = Math.max(stockQuantity, 1);
  const quantityForVariant = clampQuantity(quantity, maxQuantity);
  const outOfStock = !variant || stockQuantity < 1;

  function confirmCartAddition(addedQuantity = quantityForVariant) {
    setFlying(true);
    setNotice("Added to your cart");
    announceCommerceFeedback({
      message: "Added to cart",
      detail: `${product.title} · ${addedQuantity} unit${addedQuantity === 1 ? "" : "s"}`,
      tone: "success",
      target: "cart",
    });
    window.setTimeout(() => setFlying(false), 700);
  }

  function addToCart() {
    if (!variant) return;
    const requestedQuantity = quantityForVariant;
    if (authenticated) {
      addToServerCart.mutate(
        { variantId: variant.id, quantity: requestedQuantity },
        {
          onSuccess: () => confirmCartAddition(requestedQuantity),
          onError: () => {
            setNotice("This object could not be added. Please try again.");
            announceCommerceFeedback({
              message: "Cart link interrupted",
              detail: "The object was not added. Please try again.",
              tone: "error",
              target: "cart",
            });
          },
        },
      );
      return;
    }
    addGuestCartItem(
      {
        variantId: variant.id,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        imageUrl: activeImage?.imageUrl ?? null,
        sku: variant.sku,
        options: variant.options.map((option) => ({
          attributeType: option.attributeTypeName,
          value: option.value,
        })),
        unitPrice: variant.effectivePrice,
        currencyCode: product.currencyCode,
      },
      requestedQuantity,
    );
    confirmCartAddition(requestedQuantity);
  }

  function addToWishlist() {
    const serverItem = wishlist.data?.items.find(
      (item) =>
        item.productId === product.id &&
        item.variantId === (variant?.id ?? null),
    );
    const guestItem = guestWishlistItems.find(
      (item) =>
        item.productId === product.id &&
        item.variantId === (variant?.id ?? null),
    );
    const currentlySaved = authenticated
      ? Boolean(serverItem)
      : Boolean(guestItem);
    const nextSaved = !currentlySaved;
    const success = () => {
      setNotice(
        nextSaved ? "Saved to your objects" : "Removed from saved objects",
      );
      announceCommerceFeedback({
        message: nextSaved ? "Saved object" : "Removed from saved",
        detail: product.title,
        tone: "success",
        target: "wishlist",
      });
    };
    const failure = () => {
      setNotice("This object could not be saved. Please try again.");
      announceCommerceFeedback({
        message: "Saved objects interrupted",
        detail: "Please try that action again.",
        tone: "error",
        target: "wishlist",
      });
    };
    if (authenticated) {
      if (serverItem) {
        removeFromServerWishlist.mutate(serverItem.id, {
          onSuccess: success,
          onError: failure,
        });
      } else {
        addToServerWishlist.mutate(
          { productId: product.id, variantId: variant?.id ?? null },
          { onSuccess: success, onError: failure },
        );
      }
      return;
    }
    toggleGuestWishlistItem({
      productId: product.id,
      variantId: variant?.id ?? null,
      title: product.title,
      slug: product.slug,
      imageUrl: activeImage?.imageUrl ?? null,
      price: variant?.effectivePrice ?? product.basePrice,
      currencyCode: product.currencyCode,
    });
    success();
  }

  function selectOption(attributeTypeId: string, attributeValueId: string) {
    const next = { ...selected, [attributeTypeId]: attributeValueId };
    const exact = product.variants.find((candidate) =>
      candidate.options.every(
        (option) => next[option.attributeTypeId] === option.attributeValueId,
      ),
    );
    if (exact) setSelected(optionMap(exact));
    else {
      const compatible = product.variants.find((candidate) =>
        candidate.options.some(
          (option) =>
            option.attributeTypeId === attributeTypeId &&
            option.attributeValueId === attributeValueId,
        ),
      );
      setSelected(compatible ? optionMap(compatible) : next);
    }
    setImageIndex(0);
  }

  return (
    <div className="namou-container py-5 sm:py-8">
      {flying ? (
        <div className="fly-to-cart bg-acid text-ink pointer-events-none fixed top-1/2 left-1/2 z-[100] grid size-12 place-items-center rounded-lg">
          <ShoppingBag size={20} />
        </div>
      ) : null}
      <div className="text-subtle mb-5 font-mono text-[9px] uppercase">
        Shop / {product.category.name} /{" "}
        <span className="text-foreground">{product.title}</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_.72fr]">
        <section
          className="grid min-h-[34rem] gap-3 md:grid-cols-[1.5fr_.7fr]"
          aria-label="Product gallery"
        >
          <div className="group border-line relative overflow-hidden rounded-xl border">
            <ProductMedia
              src={activeImage?.imageUrl ?? null}
              alt={activeImage?.altText ?? product.title}
              priority
              slug={product.slug}
              category={product.category.name}
              detailed
              className="h-full min-h-[32rem]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {images.length > 1 ? (
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                <button
                  onClick={() =>
                    setImageIndex(
                      (value) => (value - 1 + images.length) % images.length,
                    )
                  }
                  className="bg-ink grid size-10 place-items-center rounded-full text-white"
                  aria-label="Previous image"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="bg-surface/80 rounded-full px-3 py-2 font-mono text-[9px] backdrop-blur">
                  {imageIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() =>
                    setImageIndex((value) => (value + 1) % images.length)
                  }
                  className="bg-ink grid size-10 place-items-center rounded-full text-white"
                  aria-label="Next image"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
          <div className="hidden grid-rows-2 gap-3 md:grid">
            {(images.length > 1 ? images.slice(1, 3) : [null, null]).map(
              (image, index) => (
                <button
                  type="button"
                  key={image?.id ?? index}
                  onClick={() => image && setImageIndex(images.indexOf(image))}
                  className="group border-line overflow-hidden rounded-xl border text-left"
                >
                  <ProductMedia
                    src={image?.imageUrl ?? null}
                    alt={
                      image?.altText ?? `${product.title} detail ${index + 2}`
                    }
                    slug={product.slug}
                    category={product.category.name}
                    detailed
                    className="h-full min-h-0"
                    sizes="24vw"
                  />
                </button>
              ),
            )}
          </div>
        </section>

        <section
          id="product-buy-box"
          className="hairline-panel flex flex-col p-5 sm:p-7"
        >
          <p className="technical-label text-subtle">
            {product.category.name} / {variant?.sku ?? "Unconfigured"}
          </p>
          <h1 className="display-title mt-3 text-5xl sm:text-7xl">
            {product.title}
          </h1>
          <Price
            amount={variant?.effectivePrice ?? product.basePrice}
            currencyCode={product.currencyCode}
            className="mt-4 text-sm"
          />
          {product.description ? (
            <p className="text-subtle mt-6 text-sm leading-6">
              {product.description}
            </p>
          ) : null}

          <div className="border-line mt-7 space-y-6 border-t pt-6">
            {product.attributes.map((attribute) => (
              <fieldset key={attribute.id}>
                <legend className="technical-label mb-3">
                  {attribute.name}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {attribute.values.map((value) => {
                    const active = selected[attribute.id] === value.id;
                    const isColor =
                      attribute.slug.toLowerCase().includes("color") ||
                      attribute.slug.toLowerCase().includes("colour");
                    return (
                      <button
                        key={value.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectOption(attribute.id, value.id)}
                        className={cn(
                          "relative min-h-10 rounded-lg border px-4 font-mono text-[10px] uppercase transition",
                          active
                            ? "border-ink bg-ink text-white"
                            : "border-line bg-surface hover:border-ink",
                          isColor && "pl-9",
                        )}
                      >
                        {isColor ? (
                          <span className="absolute top-1/2 left-3 size-3 -translate-y-1/2 rounded-full border border-current bg-current opacity-70" />
                        ) : null}
                        {value.value}
                        {active ? (
                          <Check className="ml-2 inline" size={12} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="border-line mt-6 flex items-center justify-between border-y py-4">
            <span className="technical-label">Quantity</span>
            <QuantityStepper
              value={quantityForVariant}
              max={maxQuantity}
              onChange={setQuantity}
              disabled={outOfStock || addToServerCart.isPending}
            />
          </div>

          {variant && variant.stockQuantity > 0 && variant.stockQuantity < 5 ? (
            <p className="mt-4 rounded-lg bg-[#efe7cf] p-3 font-mono text-[10px] text-[#765400] uppercase">
              Low stock / only {variant.stockQuantity} remaining
            </p>
          ) : null}
          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={addToCart}
              disabled={outOfStock || addToServerCart.isPending}
              className="action-button flex min-h-12 w-full items-center justify-between rounded-lg px-5 font-mono text-xs uppercase"
            >
              <span className="inline-flex items-center gap-2">
                {addToServerCart.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : null}
                {outOfStock
                  ? "Unavailable"
                  : addToServerCart.isPending
                    ? "Adding…"
                    : "Add to cart"}
              </span>
              {addToServerCart.isPending ? null : <Plus size={18} />}
            </button>
            <button
              type="button"
              id="wishlist"
              onClick={addToWishlist}
              disabled={
                addToServerWishlist.isPending ||
                removeFromServerWishlist.isPending
              }
              className="border-line hover:bg-muted mt-2 flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border font-mono text-[10px] uppercase transition-colors"
            >
              <Heart
                size={15}
                fill={
                  (
                    authenticated
                      ? wishlist.data?.items.some(
                          (item) =>
                            item.productId === product.id &&
                            item.variantId === (variant?.id ?? null),
                        )
                      : guestWishlistItems.some(
                          (item) =>
                            item.productId === product.id &&
                            item.variantId === (variant?.id ?? null),
                        )
                  )
                    ? "currentColor"
                    : "none"
                }
              />{" "}
              {(
                authenticated
                  ? wishlist.data?.items.some(
                      (item) =>
                        item.productId === product.id &&
                        item.variantId === (variant?.id ?? null),
                    )
                  : guestWishlistItems.some(
                      (item) =>
                        item.productId === product.id &&
                        item.variantId === (variant?.id ?? null),
                    )
              )
                ? "Saved object"
                : "Add to wishlist"}
            </button>
            {notice ? (
              <p
                className="mt-3 text-center font-mono text-[9px] uppercase"
                role="status"
              >
                {notice}
              </p>
            ) : null}
          </div>
          <details className="border-line mt-6 border-t py-4">
            <summary className="cursor-pointer font-mono text-[10px] uppercase">
              Product details
            </summary>
            <p className="text-subtle mt-3 text-sm leading-6">
              SKU {variant?.sku}. Designed as part of the Namou modular movement
              system.
            </p>
          </details>
        </section>
      </div>
      <div className="bg-background/95 border-line fixed inset-x-0 bottom-0 z-[60] grid grid-cols-[auto_1fr] items-center gap-4 border-t p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden">
        <div className="pl-1">
          <Price
            amount={variant?.effectivePrice ?? product.basePrice}
            currencyCode={product.currencyCode}
            className="font-mono text-sm font-semibold"
          />
          <p className="text-subtle mt-1 max-w-24 truncate font-mono text-[8px] uppercase">
            {variant?.options.map((option) => option.value).join(" / ") ||
              "Standard"}
          </p>
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={outOfStock || addToServerCart.isPending}
          className="action-button flex min-h-12 items-center justify-between rounded-lg px-5 font-mono text-[10px] uppercase"
        >
          <span className="inline-flex items-center gap-2">
            {addToServerCart.isPending ? <LoadingSpinner size="sm" /> : null}
            {addToServerCart.isPending ? "Adding…" : "Add to cart"}
          </span>
          {addToServerCart.isPending ? null : <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}
