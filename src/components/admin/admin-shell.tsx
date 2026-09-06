"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FolderTree,
  ListChecks,
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
            "flex min-h-11 items-center gap-3 rounded-lg px-3 font-mono text-[10px] uppercase",
            pathname === "/admin" ? "bg-acid" : "hover:bg-muted",
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
              "flex min-h-11 items-center gap-3 rounded-lg px-3 font-mono text-[10px] uppercase",
              pathname.startsWith(item.href) ? "bg-acid" : "hover:bg-muted",
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-line border-t p-3">
        <Link
          href="/"
          className="text-subtle flex min-h-10 items-center px-3 font-mono text-[9px] uppercase"
        >
          Open storefront →
        </Link>
        <button
          onClick={() => logout.mutate()}
          className="text-danger flex min-h-10 w-full items-center gap-3 px-3 font-mono text-[9px] uppercase"
        >
          <LogOut size={14} />
          Logout
        </button>
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
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center md:hidden"
            aria-label="Open admin navigation"
          >
            <Menu size={18} />
          </button>
          <span className="text-subtle hidden font-mono text-[9px] uppercase md:block">
            Namou operations / Internal system
          </span>
          <span className="font-mono text-[9px] uppercase">
            <span className="text-acid mr-2">●</span>
            {user?.role ?? "operator"}
          </span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
