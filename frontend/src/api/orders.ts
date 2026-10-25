import { api } from './client';
import type { Order } from './types/order';

export function getOrders() {
  return api.get<Order[]>('/order').then((response) => response.data);
}

export function getOrder(orderId: string) {
  return api
    .get<Order | null>(`/order/${encodeURIComponent(orderId)}`)
    .then((response) => response.data);
}

export function getOrdersByProduct(productId: string) {
  return api
    .get<Order[]>(`/order/by-product/${encodeURIComponent(productId)}`)
    .then((response) => response.data);
}
