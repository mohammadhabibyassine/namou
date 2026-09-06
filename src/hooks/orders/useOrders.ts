import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  checkoutOrder,
  getOrderById,
  getOrders,
} from "@/services/api/v1/orders.api";
import { CheckoutDto, ListOrdersQueryDto } from "@/types/models/order.model";
import { queryKeys } from "@/lib/query/keys";
import { CART_QUERY_KEY } from "../cart/useCart";
import { useAuthStore, useCartStore } from "@/store";

export const ORDER_KEYS = {
  list: (query?: ListOrdersQueryDto) => queryKeys.orders.page(query),
  detail: queryKeys.orders.detail,
};

export const useOrders = (query?: ListOrdersQueryDto) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ORDER_KEYS.list(query),
    queryFn: () => getOrders(query),
    enabled: isAuthenticated,
  });
};

export const useInfiniteOrders = (
  status?: ListOrdersQueryDto["status"],
  pageSize = 15,
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useInfiniteQuery({
    queryKey: queryKeys.orders.infinite({
      status: status ?? "all",
      pageSize,
    }),
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getOrders({
        ...(status ? { status } : {}),
        pageSize,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
    enabled: isAuthenticated,
  });
};

export const useOrderDetail = (orderId: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ORDER_KEYS.detail(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const clearLocalCart = useCartStore((state) => state.clearLocalCart);

  return useMutation({
    mutationFn: (input: CheckoutDto) => checkoutOrder(input),
    onSuccess: () => {
      clearLocalCart();
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};
