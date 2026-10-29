import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/products';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { PageHeader } from '../components/ui/PageHeader';
import { Section } from '../components/ui/Section';

export function ProductPage() {
  const { productId = '' } = useParams();
  const productQuery = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });

  return (
    <div className="page">
      <PageHeader
        title="Product"
        hint="GET /product/:productId"
        backTo="/products"
        backLabel="Back to products"
      />
      {productQuery.isPending && <Loading />}
      <ApiError error={productQuery.error} onRetry={() => productQuery.refetch()} />
      {productQuery.isSuccess && !productQuery.data && <p>Product not found.</p>}
      {productQuery.data && (
        <>
          <Section title="Details">
          <dl className="fields">
            <div>
              <dt>Id</dt>
              <dd className="mono">{productQuery.data.id}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{productQuery.data.name}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{productQuery.data.price}</dd>
            </div>
            <div>
              <dt>Stock quantity</dt>
              <dd>{productQuery.data.stockQuantity}</dd>
            </div>
          </dl>
          </Section>
          <Section title="Related">
            <div className="related-links">
              <Link to={`/orders?productId=${productQuery.data.id}`}>
                Orders for this product
              </Link>
            </div>
          </Section>
          <RawJson data={productQuery.data} />
        </>
      )}
    </div>
  );
}
