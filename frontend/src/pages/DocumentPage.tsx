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
import { PageHeader } from '../components/ui/PageHeader';
import { Section } from '../components/ui/Section';
import { StatusBadge } from '../components/ui/StatusBadge';
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
      <PageHeader
        title="Document"
        hint="GET /document/:documentId"
        backTo="/documents"
        backLabel="Back to documents"
      />
      {documentQuery.isPending && <Loading />}
      <ApiError
        error={documentQuery.error}
        onRetry={() => documentQuery.refetch()}
      />
      {documentQuery.isSuccess && !documentQuery.data && <p>Document not found.</p>}
      {documentQuery.data && (
        <>
          <Section title="Details">
            <dl className="fields">
              <div>
                <dt>Id</dt>
                <dd className="mono">{documentQuery.data.id}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={documentQuery.data.status} />
                </dd>
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
          </Section>
          <Section title="Related">
            <div className="related-links">
              <Link to={`/chunks?documentId=${documentQuery.data.id}`}>
                Chunks for this document
              </Link>
              <Link to={`/outbox?documentId=${documentQuery.data.id}`}>
                Outbox for this document
              </Link>
            </div>
          </Section>
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
          <Section title="Edit document" hint="PUT /document/:documentId">
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
          </Section>
          <Section title="Danger zone" danger>
            <p className="hint">Delete this document and its related records.</p>
            <div className="form-actions">
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
          </Section>
          <RawJson data={documentQuery.data} />
        </>
      )}
    </div>
  );
}
