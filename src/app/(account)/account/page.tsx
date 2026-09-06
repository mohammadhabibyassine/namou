import type { Metadata } from "next";
import { AccountProfile } from "@/components/account/account-profile";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountProfile />;
}
