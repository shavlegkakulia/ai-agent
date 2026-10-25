export type OrderStatus = 'DELIVERED' | 'PENDING' | 'CANCELLED' | 'REFUNDED';

export type Order = {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
};
