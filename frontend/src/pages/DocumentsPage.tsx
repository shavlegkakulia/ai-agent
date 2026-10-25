import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addDocument, getDocuments } from '../api/documents';
import { queryKeys } from '../api/queryKeys';
import type { DocumentWriteRequest } from '../api/types/document';
import { ApiError } from '../components/ApiError/ApiError';
import { DocumentForm } from '../components/DocumentForm/DocumentForm';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { formatDate } from '../lib/format';

export function DocumentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({
    queryKey: queryKeys.documents,
    queryFn: getDocuments,
  });
  const createMutation = useMutation({
    mutationFn: (body: DocumentWriteRequest) => addDocument(body),
    onSuccess: async (documentId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      navigate(`/documents/${documentId}`);
    },
  });

  return (
    <div className="page">
      <h1>Documents</h1>
      <p className="hint">GET /document</p>
      {documentsQuery.isPending && <Loading />}
      <ApiError
        error={documentsQuery.error}
        onRetry={() => documentsQuery.refetch()}
      />
      {documentsQuery.data && documentsQuery.data.length === 0 && (
        <p>No documents.</p>
      )}
      {documentsQuery.data && documentsQuery.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {documentsQuery.data.map((document) => (
                <tr
                  key={document.id}
                  className="clickable"
                  onClick={() => navigate(`/documents/${document.id}`)}
                >
                  <td>{document.title}</td>
                  <td>{document.status}</td>
                  <td>{document.version}</td>
                  <td>{formatDate(document.updatedAt)}</td>
                  <td className="mono">{document.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {documentsQuery.data && <RawJson data={documentsQuery.data} />}

      <h2>Create document</h2>
      <p className="hint">POST /document/add</p>
      <DocumentForm
        submitLabel="Create document"
        isSubmitting={createMutation.isPending}
        onSubmit={(values) => createMutation.mutate(values)}
      />
      <ApiError error={createMutation.error} />
    </div>
  );
}
