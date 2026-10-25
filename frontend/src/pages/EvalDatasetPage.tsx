import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { generateEvalDataset } from '../api/evalDataset';
import { getDocuments } from '../api/documents';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';

export function EvalDatasetPage() {
  const documentsQuery = useQuery({
    queryKey: queryKeys.documents,
    queryFn: getDocuments,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [extraIds, setExtraIds] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (documentIds: string[]) =>
      generateEvalDataset({ documentIds }),
  });

  const documentIds = useMemo(() => {
    const extra = extraIds
      .split(/[\s,]+/)
      .map((id) => id.trim())
      .filter(Boolean);
    return Array.from(new Set([...selectedIds, ...extra]));
  }, [extraIds, selectedIds]);

  const toggle = (documentId: string) => {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (documentIds.length === 0) {
      setFormError('Select or paste at least one document id.');
      return;
    }
    setFormError(null);
    mutation.mutate(documentIds);
  };

  return (
    <div className="page">
      <h1>Eval dataset generation</h1>
      <p className="hint">
        POST /eval-dataset-generation with {'{ documentIds: string[] }'}. The
        controller responds with text/csv, not JSON.
      </p>
      {documentsQuery.isPending && <Loading />}
      <ApiError
        error={documentsQuery.error}
        onRetry={() => documentsQuery.refetch()}
      />
      <form className="form" onSubmit={onSubmit}>
        <fieldset className="checklist">
          <legend>Documents</legend>
          {documentsQuery.data && documentsQuery.data.length === 0 && (
            <p className="muted">No documents returned by GET /document.</p>
          )}
          {documentsQuery.data?.map((document) => (
            <label key={document.id} className="check-row">
              <input
                type="checkbox"
                checked={selectedIds.includes(document.id)}
                onChange={() => toggle(document.id)}
              />
              <span>
                {document.title}
                <span className="mono muted"> {document.id}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <label>
          Extra document ids
          <textarea
            rows={4}
            value={extraIds}
            onChange={(event) => setExtraIds(event.target.value)}
            placeholder="One id per line, or comma-separated"
          />
        </label>
        {formError && <div className="api-error">{formError}</div>}
        <div>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Generating…' : 'Generate dataset'}
          </button>
        </div>
      </form>
      {mutation.isPending && <Loading label="Waiting for the dataset response…" />}
      <ApiError error={mutation.error} />
      {mutation.isSuccess && (
        <>
          <p className="success">Dataset generated.</p>
          <details className="raw-json" open>
            <summary>Raw API Response</summary>
            <pre>{mutation.data}</pre>
          </details>
        </>
      )}
    </div>
  );
}
