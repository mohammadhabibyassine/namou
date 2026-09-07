"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Boxes,
  FolderTree,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings2,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { useLogoutMutation } from "@/features/auth/hooks";
import { useSession } from "@/providers/session-provider";
import { permissions, type Permission } from "@/types/api";
import { cn } from "@/lib/utils/cn";

const navigation: Array<{
  href: string;
  label: string;
  icon: typeof Package;
  permissions: Permission[];
}> = [
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ListChecks,
    permissions: [permissions.manageOrders],
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    permissions: [permissions.manageProducts],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    permissions: [permissions.manageCategories],
  },
  {
    href: "/admin/attributes",
    label: "Attributes",
    icon: Settings2,
    permissions: [permissions.manageProducts],
  },
  {
    href: "/admin/chat",
    label: "Support chat",
    icon: MessageSquare,
    permissions: [permissions.manageChat],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();
  const logout = useLogoutMutation();
  const links = navigation.filter((item) =>
    item.permissions.some((permission) =>
      user?.permissions.includes(permission),
    ),
  );

  const sidebar = (
    <>
      <div className="border-line flex h-[68px] items-center justify-between border-b px-5">
        <BrandMark admin />
        <button
          onClick={() => setOpen(false)}
          className="grid size-10 place-items-center md:hidden"
          aria-label="Close admin navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Admin navigation">
        <Link
          href="/admin"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 font-mono text-[10px] font-medium uppercase transition-colors",
            pathname === "/admin"
              ? "bg-acid font-semibold text-black shadow-xs"
              : "hover:bg-muted text-ink",
          )}
        >
          <Boxes size={16} />
          Overview
        </Link>
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 font-mono text-[10px] font-medium uppercase transition-colors",
              pathname.startsWith(item.href)
                ? "bg-acid font-semibold text-black shadow-xs"
                : "hover:bg-muted text-ink",
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-line border-t p-3">
        <Link
          href="/"
          className="text-subtle hover:text-ink hover:bg-muted flex min-h-10 items-center justify-between rounded-lg px-3 font-mono text-[9px] tracking-wider uppercase transition-colors"
        >
          <span>Storefront</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f6f6f3] md:grid md:grid-cols-[13rem_1fr]">
      <aside className="border-line bg-surface hidden min-h-screen border-r md:flex md:flex-col">
        {sidebar}
      </aside>

      <div
        className={cn(
          "bg-ink/40 fixed inset-0 z-50 transition md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        onClick={() => setOpen(false)}
      >
        <aside
          className={cn(
            "bg-surface flex h-full w-72 flex-col transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {sidebar}
        </aside>
      </div>

      <div className="min-w-0">
        <header className="border-line bg-surface flex h-[68px] items-center justify-between border-b px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="border-line hover:bg-muted grid size-10 place-items-center rounded-lg border transition-colors md:hidden"
              aria-label="Open admin navigation"
            >
              <Menu size={18} />
            </button>
            <span className="text-subtle hidden font-mono text-[9px] uppercase md:block">
              Namou operations / Internal system
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="border-line bg-surface text-subtle inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-wider uppercase shadow-2xs">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-ink font-bold">
                {user?.role ?? "operator"}
              </span>
            </span>

            {/* Single Responsive Logout Button */}
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="border-line bg-surface text-ink inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 font-mono text-[9px] font-semibold tracking-wider uppercase shadow-2xs transition-all hover:border-black hover:bg-black hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Logout"
            >
              {logout.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <LogOut size={12} strokeWidth={2} />
              )}
              <span>{logout.isPending ? "Exiting…" : "Logout"}</span>
            </button>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
