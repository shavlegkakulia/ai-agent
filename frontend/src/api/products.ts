import { api } from './client';
import type { Product } from './types/product';

export function getProducts() {
  return api.get<Product[]>('/product').then((response) => response.data);
}

export function getProduct(productId: string) {
  return api
    .get<Product | null>(`/product/${encodeURIComponent(productId)}`)
    .then((response) => response.data);
}
