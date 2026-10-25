import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getCustomers } from '../api/customers';
import { getOrder } from '../api/orders';
import { getProduct } from '../api/products';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { formatDate } from '../lib/format';

export function OrderPage() {
  const { orderId = '' } = useParams();
  const orderQuery = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
  });
  const productQuery = useQuery({
    queryKey: queryKeys.product(orderQuery.data?.productId ?? ''),
    queryFn: () => getProduct(orderQuery.data?.productId ?? ''),
    enabled: Boolean(orderQuery.data?.productId),
  });
  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: getCustomers,
    enabled: Boolean(orderQuery.data),
  });
  const customer = customersQuery.data?.find(
    (item) => item.id === orderQuery.data?.customerId,
  );

  return (
    <div className="page">
      <p>
        <Link to="/orders">Back to orders</Link>
      </p>
      <h1>Order</h1>
      <p className="hint">GET /order/:orderId</p>
      {orderQuery.isPending && <Loading />}
      <ApiError error={orderQuery.error} onRetry={() => orderQuery.refetch()} />
      {orderQuery.isSuccess && !orderQuery.data && <p>Order not found.</p>}
      {orderQuery.data && (
        <>
          <dl className="fields">
            <div>
              <dt>Id</dt>
              <dd className="mono">{orderQuery.data.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{orderQuery.data.status}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{orderQuery.data.quantity}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(orderQuery.data.createdAt)}</dd>
            </div>
            <div>
              <dt>Customer id</dt>
              <dd className="mono">{orderQuery.data.customerId}</dd>
            </div>
            <div>
              <dt>Customer</dt>
              <dd>
                {customer
                  ? `${customer.name} · ${customer.phone}`
                  : 'Not found in GET /customer'}
              </dd>
            </div>
            <div>
              <dt>Product id</dt>
              <dd className="mono">{orderQuery.data.productId}</dd>
            </div>
            <div>
              <dt>Product</dt>
              <dd>
                {productQuery.data ? (
                  <Link to={`/products/${productQuery.data.id}`}>
                    {productQuery.data.name}
                  </Link>
                ) : productQuery.isPending ? (
                  'Loading product…'
                ) : (
                  'Product not found'
                )}
              </dd>
            </div>
          </dl>
          <ApiError error={productQuery.error} />
          <RawJson data={orderQuery.data} />
        </>
      )}
    </div>
  );
}
