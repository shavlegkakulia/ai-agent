import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../api/customers';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';

export function CustomersPage() {
  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: getCustomers,
  });

  return (
    <div className="page">
      <h1>Customers</h1>
      <p className="hint">GET /customer</p>
      {customersQuery.isPending && <Loading />}
      <ApiError
        error={customersQuery.error}
        onRetry={() => customersQuery.refetch()}
      />
      {customersQuery.data && customersQuery.data.length === 0 && (
        <p>No customers.</p>
      )}
      {customersQuery.data && customersQuery.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>User id</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {customersQuery.data.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td className="mono">{customer.userId ?? '—'}</td>
                  <td className="mono">{customer.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {customersQuery.data && <RawJson data={customersQuery.data} />}
    </div>
  );
}
