import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { CursorPage } from "@/types/api/common.types";
import {
  CheckoutDto,
  ListOrdersQueryDto,
  OrderDetailView,
  OrderSummaryView,
  UpdateOrderStatusDto,
} from "@/types/models/order.model";

export const checkoutOrder = async (
  input: CheckoutDto,
): Promise<OrderDetailView> => {
  const response = await apiClient.post<OrderDetailView>(
    API_ENDPOINTS.ORDERS.CHECKOUT,
    input,
  );
  return response.data;
};

export const getOrders = async (
  query?: ListOrdersQueryDto,
): Promise<CursorPage<OrderSummaryView>> => {
  const response = await apiClient.get<CursorPage<OrderSummaryView>>(
    API_ENDPOINTS.ORDERS.ROOT,
    { params: query },
  );
  return response.data;
};

export const getOrderById = async (
  orderId: string,
): Promise<OrderDetailView> => {
  const response = await apiClient.get<OrderDetailView>(
    API_ENDPOINTS.ORDERS.BY_ID(orderId),
  );
  return response.data;
};

// Admin Operations
export const getAdminOrders = async (
  query?: ListOrdersQueryDto,
): Promise<CursorPage<OrderSummaryView>> => {
  const response = await apiClient.get<CursorPage<OrderSummaryView>>(
    API_ENDPOINTS.ORDERS.ADMIN.ROOT,
    { params: query },
  );
  return response.data;
};

export const getAdminOrderById = async (
  orderId: string,
): Promise<OrderDetailView> => {
  const response = await apiClient.get<OrderDetailView>(
    API_ENDPOINTS.ORDERS.ADMIN.BY_ID(orderId),
  );
  return response.data;
};

export const updateAdminOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusDto,
): Promise<OrderDetailView> => {
  const response = await apiClient.patch<OrderDetailView>(
    API_ENDPOINTS.ORDERS.ADMIN.STATUS(orderId),
    input,
  );
  return response.data;
};
