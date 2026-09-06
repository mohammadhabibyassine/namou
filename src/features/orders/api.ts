import {
  checkoutOrder,
  getAdminOrderById,
  getAdminOrders,
  getOrderById,
  getOrders,
  updateAdminOrderStatus,
} from "@/services/api/v1/orders.api";
import type { OrderStatus } from "@/types/api";

export interface OrderListFilters {
  status?: OrderStatus;
  cursor?: string;
  pageSize?: number;
}

export const ordersApi = {
  checkout: (addressId: string, notes?: string) =>
    checkoutOrder(notes ? { addressId, notes } : { addressId }),
  list: (filters: OrderListFilters = {}) => getOrders(filters),
  detail: getOrderById,
  adminList: (filters: OrderListFilters = {}) => getAdminOrders(filters),
  adminDetail: getAdminOrderById,
  updateStatus: (orderId: string, status: OrderStatus) =>
    updateAdminOrderStatus(orderId, { status }),
};
