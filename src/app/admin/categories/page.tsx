import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Categories / Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  await requirePermission(permissions.manageCategories);
  return <CategoryManager />;
}
