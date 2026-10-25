import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getDocuments } from '../api/documents';
import { getOutboxEvents, getOutboxEventsForDocument } from '../api/outbox';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { formatDate } from '../lib/format';

export function OutboxPage() {
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
  const outboxQuery = useQuery({
    queryKey: documentId
      ? queryKeys.outboxByDocument(documentId)
      : queryKeys.outbox,
    queryFn: () =>
      documentId ? getOutboxEventsForDocument(documentId) : getOutboxEvents(),
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

  return (
    <div className="page">
      <h1>Outbox</h1>
      <p className="hint">
        {documentId ? 'GET /outbox/:documentId' : 'GET /outbox/all'}
      </p>
      <form className="toolbar" onSubmit={onSubmit}>
        <label>
          Document
          <select
            value={documentId}
            onChange={(event) => applyFilter(event.target.value)}
          >
            <option value="">All events</option>
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
      </form>
      <ApiError error={documentsQuery.error} />
      {outboxQuery.isPending && <Loading />}
      <ApiError error={outboxQuery.error} onRetry={() => outboxQuery.refetch()} />
      {outboxQuery.data && outboxQuery.data.length === 0 && <p>No outbox events.</p>}
      {outboxQuery.data && outboxQuery.data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Document</th>
                <th>Attempts</th>
                <th>Created</th>
                <th>Published</th>
                <th>Owner</th>
                <th>Payload</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {outboxQuery.data.map((event) => (
                <tr key={event.id}>
                  <td>{event.type}</td>
                  <td>
                    {event.document?.title ?? '—'}
                    <div className="mono muted">{event.aggregateId}</div>
                  </td>
                  <td>{event.attempts}</td>
                  <td>{formatDate(event.createdAt)}</td>
                  <td>{formatDate(event.publishedAt)}</td>
                  <td>{event.owner ?? '—'}</td>
                  <td>
                    <pre className="text-panel compact">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </td>
                  <td className="mono">{event.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {outboxQuery.data && <RawJson data={outboxQuery.data} />}
    </div>
  );
}
