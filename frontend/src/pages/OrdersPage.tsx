import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getCustomers } from '../api/customers';
import { getOrders, getOrdersByProduct } from '../api/orders';
import { getProducts } from '../api/products';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { PageHeader } from '../components/ui/PageHeader';
import { Section } from '../components/ui/Section';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDate } from '../lib/format';

export function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const productId = searchParams.get('productId') ?? '';
  const [draftProductId, setDraftProductId] = useState(productId);

  useEffect(() => {
    setDraftProductId(productId);
  }, [productId]);

  const ordersQuery = useQuery({
    queryKey: productId ? queryKeys.ordersByProduct(productId) : queryKeys.orders,
    queryFn: () => (productId ? getOrdersByProduct(productId) : getOrders()),
  });
  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
  });
  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: getCustomers,
  });

  const productById = new Map(
    (productsQuery.data ?? []).map((product) => [product.id, product]),
  );
  const customerById = new Map(
    (customersQuery.data ?? []).map((customer) => [customer.id, customer]),
  );

  const setProductFilter = (nextProductId: string) => {
    if (nextProductId) {
      setSearchParams({ productId: nextProductId });
    } else {
      setSearchParams({});
    }
    setDraftProductId(nextProductId);
  };

  const onFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    setProductFilter(draftProductId.trim());
  };

  return (
    <div className="page">
      <PageHeader
        title="Orders"
        hint={
          productId
            ? 'GET /order/by-product/:productId'
            : 'GET /order. The order payload has customerId and productId, not nested customer or product objects.'
        }
      />
      <Section title="Filter">
      <form className="toolbar" onSubmit={onFilterSubmit}>
        <label className="form-field">
          <span className="form-label">Product</span>
          <select
            className="form-control"
            value={productId}
            onChange={(event) => setProductFilter(event.target.value)}
          >
            <option value="">All orders</option>
            {productsQuery.data?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="form-label">Product id</span>
          <input
            className="form-control"
            value={draftProductId}
            onChange={(event) => setDraftProductId(event.target.value)}
            placeholder="Filter by product id"
          />
        </label>
        <div className="form-actions">
          <button type="submit">Apply</button>
        </div>
      </form>
      </Section>
      <ApiError error={productsQuery.error} />
      {ordersQuery.isPending && <Loading />}
      <ApiError error={ordersQuery.error} onRetry={() => ordersQuery.refetch()} />
      {ordersQuery.data && ordersQuery.data.length === 0 && <p>No orders.</p>}
      {ordersQuery.data && ordersQuery.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Created</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.data.map((order) => {
                const customer = customerById.get(order.customerId);
                const product = productById.get(order.productId);
                return (
                  <tr
                    key={order.id}
                    className="clickable"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      {customer ? (
                        <>
                          {customer.name}
                          <div className="muted">{customer.phone}</div>
                        </>
                      ) : (
                        '—'
                      )}
                      <div className="mono muted">{order.customerId}</div>
                    </td>
                    <td>
                      {product ? product.name : '—'}
                      <div className="mono muted">{order.productId}</div>
                    </td>
                    <td>{order.quantity}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="mono">{order.id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {customersQuery.isError && (
        <p className="hint">
          Customer names could not be loaded.{' '}
          <Link to="/customers">Open customers</Link>
        </p>
      )}
      {ordersQuery.data && <RawJson data={ordersQuery.data} />}
    </div>
  );
}
