import { api } from './client';
import type { Customer } from './types/customer';

export function getCustomers() {
  return api.get<Customer[]>('/customer').then((response) => response.data);
}
