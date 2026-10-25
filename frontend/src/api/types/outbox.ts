import type { DocumentRecord } from './document';

export type OutboxEvent = {
  id: string;
  type: string;
  payload: unknown;
  aggregateId: string;
  attempts: number;
  createdAt: string;
  publishedAt: string | null;
  owner: string | null;
  ownedAt: string | null;
  document: DocumentRecord | null;
};
