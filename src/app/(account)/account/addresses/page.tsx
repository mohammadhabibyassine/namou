import type { Metadata } from "next";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = {
  title: "Saved addresses",
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressManager />;
}
