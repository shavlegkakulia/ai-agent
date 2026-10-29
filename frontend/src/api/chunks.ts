import { api } from './client';
import type {
  CreateChunkRequest,
  DeleteChunksResult,
  DocumentChunk,
  RechunkDocumentRequest,
} from './types/chunk';

export function getChunks() {
  return api.get<DocumentChunk[]>('/chunks').then((response) => response.data);
}

export function getChunksForDocument(documentId: string) {
  return api
    .get<DocumentChunk[]>(`/chunks/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}

export function createChunksForDocument(
  documentId: string,
  body: CreateChunkRequest,
) {
  return api
    .post<number>(`/chunks/${encodeURIComponent(documentId)}`, body)
    .then((response) => response.data);
}

export function rechunkDocument(
  documentId: string,
  body: RechunkDocumentRequest,
) {
  return api
    .post<void>(`/chunks/${encodeURIComponent(documentId)}/rechunk`, body)
    .then((response) => response.data);
}

export function deleteChunks(documentId: string) {
  return api
    .delete<DeleteChunksResult>(`/chunks/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}
