import type { Metadata } from "next";
import { AdminChat } from "@/components/admin/admin-chat";
import { requirePermission } from "@/lib/auth/dal";
import { permissions } from "@/types/api";

export const metadata: Metadata = {
  title: "Live chat / Admin",
  robots: { index: false, follow: false },
};

export default async function AdminChatPage() {
  await requirePermission(permissions.manageChat);
  return <AdminChat />;
}
