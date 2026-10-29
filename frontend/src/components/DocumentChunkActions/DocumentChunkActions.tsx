import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChunksForDocument, rechunkDocument } from '../../api/chunks';
import { queryKeys } from '../../api/queryKeys';
import {
  SPLIT_STRATEGIES,
  type SplitStrategy,
} from '../../api/types/document';
import { ApiError } from '../ApiError/ApiError';
import { Section } from '../ui/Section';

type DocumentChunkActionsProps = {
  documentId: string;
  version?: number;
  hasChunks: boolean;
};

export function DocumentChunkActions({
  documentId,
  version,
  hasChunks,
}: DocumentChunkActionsProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [chunkIndex, setChunkIndex] = useState('0');
  const [embedding, setEmbedding] = useState('');
  const [rechunkVersion, setRechunkVersion] = useState(
    version == null ? '' : String(version),
  );
  const [splitStrategy, setSplitStrategy] =
    useState<SplitStrategy>('recursive');
  const [createError, setCreateError] = useState<string | null>(null);
  const [rechunkError, setRechunkError] = useState<string | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.document(documentId),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.chunks });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.chunksByDocument(documentId),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.outbox });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.outboxByDocument(documentId),
    });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createChunksForDocument(documentId, {
        content,
        chunkIndex: Number(chunkIndex),
        embedding,
      }),
    onSuccess: refresh,
  });
  const rechunkMutation = useMutation({
    mutationFn: () =>
      rechunkDocument(documentId, {
        version: Number(rechunkVersion),
        splitStrategy,
      }),
    onSuccess: refresh,
  });

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    const index = Number(chunkIndex);
    if (!content.trim() || !embedding.trim() || !Number.isFinite(index)) {
      setCreateError('Content, chunk index, and embedding are required.');
      return;
    }
    setCreateError(null);
    createMutation.mutate();
  };

  const onRechunk = (event: FormEvent) => {
    event.preventDefault();
    const nextVersion = Number(rechunkVersion);
    if (!Number.isFinite(nextVersion)) {
      setRechunkError('Version is required.');
      return;
    }
    if (
      !window.confirm(
        'Rechunk this document? This regenerates its chunks.',
      )
    ) {
      return;
    }
    setRechunkError(null);
    rechunkMutation.mutate();
  };

  return (
    <>
      <Section title="Add chunk" hint="POST /chunks/:documentId">
      <form className="form" onSubmit={onCreate}>
        <label className="form-field">
          <span className="form-label">Content</span>
          <textarea
            className="form-control"
            rows={8}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-label">Chunk index</span>
          <input
            className="form-control form-control-short"
            type="number"
            value={chunkIndex}
            onChange={(event) => setChunkIndex(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-label">Embedding</span>
          <textarea
            className="form-control form-control-compact"
            rows={4}
            value={embedding}
            onChange={(event) => setEmbedding(event.target.value)}
          />
          <span className="form-help">
            Embedding is the string stored on the chunk, such as a vector
            literal.
          </span>
        </label>
        {createError && <div className="api-error">{createError}</div>}
        <ApiError error={createMutation.error} />
        {createMutation.isSuccess && <p className="success">Chunk created.</p>}
        <div className="form-actions">
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding…' : 'Add chunk'}
          </button>
        </div>
      </form>
      </Section>
      {hasChunks && (
        <Section title="Rechunk" hint="POST /chunks/:documentId/rechunk">
        <form className="form" onSubmit={onRechunk}>
          <label className="form-field">
            <span className="form-label">Version</span>
            <input
              className="form-control form-control-short"
              type="number"
              value={rechunkVersion}
              onChange={(event) => setRechunkVersion(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="form-label">Split strategy</span>
            <select
              className="form-control form-control-short"
              value={splitStrategy}
              onChange={(event) =>
                setSplitStrategy(event.target.value as SplitStrategy)
              }
            >
              {SPLIT_STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </label>
          {rechunkError && <div className="api-error">{rechunkError}</div>}
          <ApiError error={rechunkMutation.error} />
          {rechunkMutation.isSuccess && (
            <p className="success">Rechunk queued.</p>
          )}
          <div className="form-actions">
            <button type="submit" disabled={rechunkMutation.isPending}>
              {rechunkMutation.isPending ? 'Rechunking…' : 'Rechunk'}
            </button>
          </div>
        </form>
        </Section>
      )}
    </>
  );
}
