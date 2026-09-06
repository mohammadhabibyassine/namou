import type { Metadata } from "next";
import { AdminProducts } from "@/components/admin/admin-products";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Products / Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  await requirePermission(permissions.manageProducts);
  return <AdminProducts />;
}
