import type { Metadata } from "next";
import { OrderConfirmationView } from "@/components/orders/order-confirmation-view";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderConfirmationView orderId={orderId} />;
}
