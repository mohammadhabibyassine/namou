import type { Metadata } from "next";
import { ProductVariantEditor } from "@/components/admin/product-variant-editor";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Variant matrix / Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  await requirePermission(permissions.manageProducts);
  return <ProductVariantEditor productId={productId} />;
}
