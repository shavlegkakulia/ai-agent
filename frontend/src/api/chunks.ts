import { api } from './client';
import type { DeleteChunksResult, DocumentChunk } from './types/chunk';

export function getChunks() {
  return api.get<DocumentChunk[]>('/chunks').then((response) => response.data);
}

export function getChunksForDocument(documentId: string) {
  return api
    .get<DocumentChunk[]>(`/chunks/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}

export function deleteChunks(documentId: string) {
  return api
    .delete<DeleteChunksResult>(`/chunks/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}
