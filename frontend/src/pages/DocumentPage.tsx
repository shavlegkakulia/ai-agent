import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getChunksForDocument } from '../api/chunks';
import { deleteDocument, getDocument, updateDocument } from '../api/documents';
import { queryKeys } from '../api/queryKeys';
import type { DocumentWriteRequest } from '../api/types/document';
import { ApiError } from '../components/ApiError/ApiError';
import { DocumentChunkActions } from '../components/DocumentChunkActions/DocumentChunkActions';
import { DocumentForm } from '../components/DocumentForm/DocumentForm';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { formatDate } from '../lib/format';

export function DocumentPage() {
  const { documentId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const documentQuery = useQuery({
    queryKey: queryKeys.document(documentId),
    queryFn: () => getDocument(documentId),
    enabled: Boolean(documentId),
  });
  const chunksQuery = useQuery({
    queryKey: queryKeys.chunksByDocument(documentId),
    queryFn: () => getChunksForDocument(documentId),
    enabled: Boolean(documentId) && Boolean(documentQuery.data),
  });
  const updateMutation = useMutation({
    mutationFn: (body: DocumentWriteRequest) => updateDocument(documentId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.document(documentId),
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      navigate('/documents');
    },
  });

  const onDelete = () => {
    if (!window.confirm('Delete this document?')) return;
    deleteMutation.mutate();
  };

  return (
    <div className="page">
      <p>
        <Link to="/documents">Back to documents</Link>
      </p>
      <h1>Document</h1>
      <p className="hint">GET /document/:documentId</p>
      {documentQuery.isPending && <Loading />}
      <ApiError
        error={documentQuery.error}
        onRetry={() => documentQuery.refetch()}
      />
      {documentQuery.isSuccess && !documentQuery.data && <p>Document not found.</p>}
      {documentQuery.data && (
        <>
          <dl className="fields">
            <div>
              <dt>Id</dt>
              <dd className="mono">{documentQuery.data.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{documentQuery.data.status}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{documentQuery.data.version}</dd>
            </div>
            <div>
              <dt>User id</dt>
              <dd className="mono">{documentQuery.data.userId}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(documentQuery.data.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(documentQuery.data.updatedAt)}</dd>
            </div>
          </dl>
          <p>
            <Link to={`/chunks?documentId=${documentQuery.data.id}`}>
              Chunks for this document
            </Link>
            {' · '}
            <Link to={`/outbox?documentId=${documentQuery.data.id}`}>
              Outbox for this document
            </Link>
          </p>
          {chunksQuery.isPending && <Loading label="Loading chunks…" />}
          <ApiError
            error={chunksQuery.error}
            onRetry={() => chunksQuery.refetch()}
          />
          {chunksQuery.data && (
            <DocumentChunkActions
              key={`${documentQuery.data.id}-${documentQuery.data.version}`}
              documentId={documentQuery.data.id}
              version={documentQuery.data.version}
              hasChunks={chunksQuery.data.length > 0}
            />
          )}
          <h2>Edit</h2>
          <p className="hint">PUT /document/:documentId</p>
          <DocumentForm
            key={`${documentQuery.data.id}-${documentQuery.data.updatedAt}`}
            initialTitle={documentQuery.data.title}
            initialContent={documentQuery.data.content}
            submitLabel="Save document"
            isSubmitting={updateMutation.isPending}
            onSubmit={(values) => updateMutation.mutate(values)}
          />
          <ApiError error={updateMutation.error} />
          {updateMutation.isSuccess && (
            <p className="success">Saved. Returned id: {updateMutation.data}</p>
          )}
          <div className="toolbar">
            <button
              type="button"
              className="danger"
              onClick={onDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete document'}
            </button>
          </div>
          <ApiError error={deleteMutation.error} />
          <RawJson data={documentQuery.data} />
        </>
      )}
    </div>
  );
}
