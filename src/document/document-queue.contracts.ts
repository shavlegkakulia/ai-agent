import { SplitStrategy } from '../textSplitter/strategies';

export enum QueueName {
  DOCUMENT = 'document',
}

export enum JobName {
  PROCESS_DOCUMENT = 'processDocument',
  UPDATE_DOCUMENT = 'updateDocument',
}

export interface DocumentProcessorData {
  documentId: string;
  userId: string;
  version: number;
  splitStrategy: SplitStrategy;
}
