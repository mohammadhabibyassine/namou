"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { useCart } from "@/hooks/cart";
import { useWishlist } from "@/hooks/wishlist";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?sort=newest", label: "Drops" },
  { href: "/shop", label: "Categories" },
] as const;

function Count({ value }: { value: number }) {
  return (
    <span className="font-mono text-[10px] tabular-nums">
      {String(value).padStart(2, "0")}
    </span>
  );
}

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const { authenticated, status } = useSession();
  const guestCartCount = useGuestCommerce((state) =>
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
  );
  const guestWishlistCount = useGuestCommerce(
    (state) => state.wishlistItems.length,
  );
  const cart = useCart();
  const wishlist = useWishlist({ pageSize: 100 });
  const cartCount = authenticated
    ? (cart.data?.quantityTotal ?? 0)
    : guestCartCount;
  const wishlistCount = authenticated
    ? (wishlist.data?.itemCount ?? 0)
    : guestWishlistCount;

  return (
    <header className="border-line/80 bg-background/95 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="namou-container flex h-16 items-center justify-between gap-5 sm:h-[76px]">
        <BrandMark className="text-lg sm:text-xl" />

        <nav
          className="hidden items-center gap-14 text-xs font-medium uppercase md:flex"
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-opacity hover:opacity-55"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/shop?focus=search"
            className="hidden min-h-11 items-center gap-2 px-3 text-xs uppercase sm:inline-flex"
          >
            <Search aria-hidden="true" size={17} strokeWidth={1.6} />
            <span className="hidden lg:inline">Search</span>
          </Link>
          <Link
            href="/wishlist"
            className="hover:bg-muted relative hidden size-11 place-items-center rounded-full transition-colors sm:grid"
            aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
          >
            <Heart aria-hidden="true" size={19} strokeWidth={1.6} />
          </Link>
          <Link
            href={authenticated ? "/account" : "/login"}
            className="hover:bg-muted hidden size-11 place-items-center rounded-full transition-colors lg:grid"
            aria-label={authenticated ? "Account" : "Log in"}
          >
            <UserRound aria-hidden="true" size={18} strokeWidth={1.6} />
          </Link>
          <Link
            href="/cart"
            className="bg-ink inline-flex min-h-11 items-center gap-3 rounded-lg px-4 text-white transition-transform motion-safe:hover:scale-[1.03]"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag aria-hidden="true" size={17} strokeWidth={1.6} />
            <span className="text-xs uppercase">Cart</span>
            <Count value={cartCount} />
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X aria-hidden="true" size={20} />
            ) : (
              <Menu aria-hidden="true" size={20} />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "namou-container overflow-hidden transition-[max-height,opacity] duration-300 md:hidden",
          open ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav
          className="hairline-panel grid gap-1 p-2"
          aria-label="Mobile navigation"
        >
          {[
            ...links,
            {
              href: "/wishlist",
              label: `Wishlist / ${String(wishlistCount).padStart(2, "0")}`,
            },
            {
              href: authenticated ? "/account" : "/login",
              label:
                status === "loading"
                  ? "Account"
                  : authenticated
                    ? "Account"
                    : "Login",
            },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="hover:bg-muted rounded-lg px-4 py-3 font-mono text-xs uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
