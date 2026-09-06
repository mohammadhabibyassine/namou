"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogoutMutation } from "@/features/auth/hooks";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/account", label: "Profile" },
  { href: "/account/addresses", label: "Saved addresses" },
  { href: "/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
] as const;

export function AccountTabs() {
  const pathname = usePathname();
  const logout = useLogoutMutation();
  return (
    <nav
      className="border-line hide-scrollbar flex gap-2 overflow-x-auto border-b pb-2"
      aria-label="Account navigation"
    >
      {links.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === link.href
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-4 py-3 font-mono text-[10px] uppercase",
              active ? "bg-ink text-white" : "hover:bg-muted",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => logout.mutate()}
        className="text-danger ml-auto shrink-0 px-4 py-3 font-mono text-[10px] uppercase"
        disabled={logout.isPending}
      >
        {logout.isPending ? "Leaving…" : "Logout"}
      </button>
    </nav>
  );
}
