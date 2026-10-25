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
