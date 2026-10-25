import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';

export function ProductsPage() {
  const navigate = useNavigate();
  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
  });

  return (
    <div className="page">
      <h1>Products</h1>
      <p className="hint">GET /product</p>
      {productsQuery.isPending && <Loading />}
      <ApiError error={productsQuery.error} onRetry={() => productsQuery.refetch()} />
      {productsQuery.data && productsQuery.data.length === 0 && <p>No products.</p>}
      {productsQuery.data && productsQuery.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.data.map((product) => (
                <tr
                  key={product.id}
                  className="clickable"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.stockQuantity}</td>
                  <td className="mono">{product.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {productsQuery.data && <RawJson data={productsQuery.data} />}
    </div>
  );
}
