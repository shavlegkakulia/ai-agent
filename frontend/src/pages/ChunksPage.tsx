import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { deleteChunks, getChunks, getChunksForDocument } from '../api/chunks';
import { getDocuments } from '../api/documents';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { DocumentChunkActions } from '../components/DocumentChunkActions/DocumentChunkActions';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { formatDate } from '../lib/format';

export function ChunksPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const documentId = searchParams.get('documentId') ?? '';
  const [draftDocumentId, setDraftDocumentId] = useState(documentId);

  useEffect(() => {
    setDraftDocumentId(documentId);
  }, [documentId]);

  const documentsQuery = useQuery({
    queryKey: queryKeys.documents,
    queryFn: getDocuments,
  });
  const chunksQuery = useQuery({
    queryKey: documentId
      ? queryKeys.chunksByDocument(documentId)
      : queryKeys.chunks,
    queryFn: () =>
      documentId ? getChunksForDocument(documentId) : getChunks(),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteChunks(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chunks });
    },
  });

  const applyFilter = (nextDocumentId: string) => {
    if (nextDocumentId) {
      setSearchParams({ documentId: nextDocumentId });
    } else {
      setSearchParams({});
    }
    setDraftDocumentId(nextDocumentId);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    applyFilter(draftDocumentId.trim());
  };

  const onDelete = () => {
    if (!documentId) return;
    if (!window.confirm(`Delete all chunks for document ${documentId}?`)) return;
    deleteMutation.mutate();
  };

  return (
    <div className="page">
      <h1>Chunks</h1>
      <p className="hint">
        {documentId
          ? 'GET /chunks/:documentId'
          : 'GET /chunks. Chunks have no title or metadata fields.'}
      </p>
      <form className="toolbar" onSubmit={onSubmit}>
        <label>
          Document
          <select
            value={documentId}
            onChange={(event) => applyFilter(event.target.value)}
          >
            <option value="">All chunks</option>
            {documentsQuery.data?.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Document id
          <input
            value={draftDocumentId}
            onChange={(event) => setDraftDocumentId(event.target.value)}
            placeholder="Document id"
          />
        </label>
        <button type="submit">Apply</button>
        {documentId && (
          <button
            type="button"
            className="danger"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete chunks'}
          </button>
        )}
      </form>
      <ApiError error={documentsQuery.error} />
      {documentId && chunksQuery.data && (
        <DocumentChunkActions
          key={documentId}
          documentId={documentId}
          version={
            documentsQuery.data?.find((document) => document.id === documentId)
              ?.version
          }
          hasChunks={chunksQuery.data.length > 0}
        />
      )}
      {deleteMutation.isSuccess && (
        <p className="success">Deleted {deleteMutation.data.count} chunks.</p>
      )}
      <ApiError error={deleteMutation.error} />
      {chunksQuery.isPending && <Loading />}
      <ApiError error={chunksQuery.error} onRetry={() => chunksQuery.refetch()} />
      {chunksQuery.data && chunksQuery.data.length === 0 && <p>No chunks.</p>}
      <div className="stack">
        {chunksQuery.data?.map((chunk) => (
          <article key={chunk.id} className="panel">
            <dl className="fields">
              <div>
                <dt>Chunk id</dt>
                <dd className="mono">{chunk.id}</dd>
              </div>
              <div>
                <dt>Document id</dt>
                <dd className="mono">{chunk.documentId}</dd>
              </div>
              <div>
                <dt>Chunk index</dt>
                <dd>{chunk.chunkIndex}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(chunk.createdAt)}</dd>
              </div>
            </dl>
            <pre className="text-panel">{chunk.content}</pre>
          </article>
        ))}
      </div>
      {chunksQuery.data && <RawJson data={chunksQuery.data} />}
    </div>
  );
}
