import type { Metadata } from "next";
import { AdminOrders } from "@/components/admin/admin-orders";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Orders / Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  await requirePermission(permissions.manageOrders);
  return <AdminOrders />;
}
