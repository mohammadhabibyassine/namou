import { CursorPaginationQuery } from "../api/common.types";

export const OrderStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderSummaryView {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderShippingAddress {
  recipientName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  countryCode: string;
  phone: string | null;
}

export interface OrderItemView {
  id: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantLabel: string | null;
  sku: string;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  createdAt: string;
}

export interface OrderStatusHistoryView {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  createdAt: string;
}

export interface OrderDetailView {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string;
  shippingCost: string;
  taxAmount: string;
  total: string;
  currencyCode: string;
  shippingAddress: OrderShippingAddress;
  notes: string | null;
  items: OrderItemView[];
  statusHistory: OrderStatusHistoryView[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutDto {
  addressId: string;
  notes?: string | null;
}

export interface ListOrdersQueryDto extends CursorPaginationQuery {
  status?: OrderStatus;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// Aliases for compatibility
export type Order = OrderDetailView;
export type OrderSummary = OrderSummaryView;
