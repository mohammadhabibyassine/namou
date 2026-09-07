"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
        disabled={logout.isPending}
        className="border-line bg-surface text-ink ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 font-mono text-[9px] font-semibold tracking-wider uppercase shadow-2xs transition-all hover:border-black hover:bg-black hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Logout"
      >
        {logout.isPending ? (
          <LoadingSpinner size="xs" />
        ) : (
          <LogOut size={12} strokeWidth={2} />
        )}
        <span>{logout.isPending ? "Exiting…" : "Logout"}</span>
      </button>
    </nav>
  );
}
