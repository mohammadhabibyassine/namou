import type { Metadata } from "next";
import { AttributeManager } from "@/components/admin/attribute-manager";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Attributes / Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAttributesPage() {
  await requirePermission(permissions.manageProducts);
  return <AttributeManager />;
}
