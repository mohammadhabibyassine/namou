import type { ReactNode } from "react";
import { requireAnyPermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";
import { AdminShell } from "@/components/admin/admin-shell";

const adminPermissions = [
  permissions.manageProducts,
  permissions.manageCategories,
  permissions.manageOrders,
  permissions.manageChat,
] as const;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAnyPermission(adminPermissions);
  return <AdminShell>{children}</AdminShell>;
}
