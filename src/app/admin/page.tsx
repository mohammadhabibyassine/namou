import Link from "next/link";
import {
  ArrowRight,
  FolderTree,
  ListChecks,
  MessageSquare,
  Package,
  Settings2,
} from "lucide-react";
import { requireAnyPermission } from "@/lib/auth/dal";
import { permissions, type Permission } from "@/types/api";

const areas = [
  {
    href: "/admin/orders",
    title: "Orders",
    label: "Dispatch queue",
    icon: ListChecks,
    permission: permissions.manageOrders,
  },
  {
    href: "/admin/products",
    title: "Products",
    label: "Catalog objects",
    icon: Package,
    permission: permissions.manageProducts,
  },
  {
    href: "/admin/categories",
    title: "Categories",
    label: "Navigation tree",
    icon: FolderTree,
    permission: permissions.manageCategories,
  },
  {
    href: "/admin/attributes",
    title: "Attributes",
    label: "Variant options",
    icon: Settings2,
    permission: permissions.manageProducts,
  },
  {
    href: "/admin/chat",
    title: "Support",
    label: "Live channel",
    icon: MessageSquare,
    permission: permissions.manageChat,
  },
] satisfies Array<{
  href: string;
  title: string;
  label: string;
  icon: typeof Package;
  permission: Permission;
}>;

export default async function AdminPage() {
  const user = await requireAnyPermission([
    permissions.manageOrders,
    permissions.manageProducts,
    permissions.manageCategories,
    permissions.manageChat,
  ]);
  const visibleAreas = areas.filter((area) =>
    user.permissions.includes(area.permission),
  );
  return (
    <div className="p-4 sm:p-7">
      <p className="technical-label text-subtle">Operations / Control plane</p>
      <h1 className="display-title mt-2 text-6xl sm:text-8xl">
        System overview
      </h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visibleAreas.map((area, index) => (
          <Link
            key={area.href}
            href={area.href}
            className="group hairline-panel hover:bg-ink flex min-h-56 flex-col justify-between p-5 transition-colors hover:text-white"
          >
            <div className="flex items-start justify-between">
              <area.icon size={20} />
              <span className="text-subtle font-mono text-[9px]">
                0{index + 1}
              </span>
            </div>
            <div>
              <p className="display-title text-4xl">{area.title}</p>
              <p className="mt-2 font-mono text-[9px] uppercase opacity-55">
                {area.label}
              </p>
              <ArrowRight
                className="mt-5 transition-transform group-hover:translate-x-2"
                size={17}
              />
            </div>
          </Link>
        ))}
      </div>
      <section className="technical-grid border-line mt-4 grid min-h-64 place-items-center rounded-xl border">
        <div className="text-center">
          <span className="bg-acid inline-block size-3 rounded-full" />
          <p className="display-title mt-5 text-5xl">Operations ready.</p>
          <p className="text-subtle mt-2 font-mono text-[9px] uppercase">
            Choose a control surface to begin
          </p>
        </div>
      </section>
    </div>
  );
}
