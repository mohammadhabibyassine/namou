import type { Metadata } from "next";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Order record / Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  await requirePermission(permissions.manageOrders);
  return <AdminOrderDetail orderId={orderId} />;
}
