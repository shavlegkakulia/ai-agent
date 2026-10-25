import { api } from './client';
import type { DocumentRecord, DocumentWriteRequest } from './types/document';

export function getDocuments() {
  return api.get<DocumentRecord[]>('/document').then((response) => response.data);
}

export function getDocument(documentId: string) {
  return api
    .get<DocumentRecord | null>(`/document/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}

export function addDocument(body: DocumentWriteRequest) {
  return api
    .post<string>('/document/add', body)
    .then((response) => response.data);
}

export function updateDocument(documentId: string, body: DocumentWriteRequest) {
  return api
    .put<string>(`/document/${encodeURIComponent(documentId)}`, body)
    .then((response) => response.data);
}

export function deleteDocument(documentId: string) {
  return api
    .delete<DocumentRecord>(`/document/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}
