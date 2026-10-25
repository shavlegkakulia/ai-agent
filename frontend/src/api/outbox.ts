import { api } from './client';
import type { OutboxEvent } from './types/outbox';

export function getOutboxEvents() {
  return api.get<OutboxEvent[]>('/outbox/all').then((response) => response.data);
}

export function getOutboxEventsForDocument(documentId: string) {
  return api
    .get<OutboxEvent[]>(`/outbox/${encodeURIComponent(documentId)}`)
    .then((response) => response.data);
}
