"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Heart, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { useCart } from "@/hooks/cart";
import { useWishlist } from "@/hooks/wishlist";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import { cn } from "@/lib/utils/cn";

export function StoreMobileDock() {
  const pathname = usePathname();
  const { authenticated } = useSession();
  const guestCartCount = useGuestCommerce((state) =>
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
  );
  const guestWishlistCount = useGuestCommerce(
    (state) => state.wishlistItems.length,
  );
  const cart = useCart({ enabled: authenticated });
  const wishlist = useWishlist({ pageSize: 100 }, { enabled: authenticated });
  const cartCount = authenticated
    ? (cart.data?.quantityTotal ?? 0)
    : guestCartCount;
  const wishlistCount = authenticated
    ? (wishlist.data?.itemCount ?? 0)
    : guestWishlistCount;

  if (
    pathname.startsWith("/shop/") ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-confirmation")
  ) {
    return null;
  }

  const items = [
    {
      href: "/shop",
      label: "Shop",
      icon: Grid2X2,
      active: pathname === "/shop",
    },
    {
      href: "/drops",
      label: "Drops",
      icon: Sparkles,
      active: pathname.startsWith("/drops"),
    },
    {
      href: "/wishlist",
      label: "Saved",
      icon: Heart,
      active: pathname === "/wishlist",
      count: wishlistCount,
    },
    {
      href: authenticated ? "/account" : "/login",
      label: "Account",
      icon: UserRound,
      active: pathname.startsWith("/account"),
    },
    {
      href: "/cart",
      label: "Bag",
      icon: ShoppingBag,
      active: pathname === "/cart",
      count: cartCount,
    },
  ];

  return (
    <nav
      aria-label="Mobile storefront navigation"
      className="bg-background/95 border-line fixed inset-x-0 bottom-0 z-50 grid h-[4.6rem] grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "relative grid place-items-center gap-0.5 py-2 font-mono text-[8px] uppercase",
              item.active ? "text-foreground" : "text-subtle",
            )}
          >
            <span className="relative">
              <Icon
                size={17}
                strokeWidth={1.5}
                fill={
                  item.active && item.label === "Saved"
                    ? "currentColor"
                    : "none"
                }
              />
              {item.count ? (
                <span className="bg-acid text-ink absolute -top-2 -right-3 grid min-w-4 place-items-center rounded-full px-1 text-[7px] leading-4">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              ) : null}
            </span>
            {item.label}
            {item.active ? (
              <span className="bg-acid absolute bottom-1 size-1 rounded-full" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
