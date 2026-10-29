import type { SplitStrategy } from './document';

export type CreateChunkRequest = {
  content: string;
  chunkIndex: number;
  embedding: string;
};

export type RechunkDocumentRequest = {
  version: number;
  splitStrategy: SplitStrategy;
};

export type DocumentChunk = {
  id: string;
  content: string;
  userId: string;
  documentId: string;
  chunkIndex: number;
  embedding: unknown;
  createdAt: string;
};

export type DeleteChunksResult = {
  count: number;
};
