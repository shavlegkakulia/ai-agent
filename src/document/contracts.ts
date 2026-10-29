import { SplitStrategy } from '../textSplitter/constant';

export enum QueueName {
  DOCUMENT = 'document',
}

export enum JobName {
  PROCESS_DOCUMENT = 'processDocument',
  UPDATE_DOCUMENT = 'updateDocument',
  RECHUNK_DOCUMENT = 'rechunkDocument',
}

export interface DocumentProcessorData {
  documentId: string;
  userId: string;
  version: number;
  splitStrategy: SplitStrategy;
}
