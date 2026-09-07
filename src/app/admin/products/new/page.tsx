import type { Metadata } from "next";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Create product / Admin",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requirePermission(permissions.manageProducts);
  return <ProductCreateForm />;
}
