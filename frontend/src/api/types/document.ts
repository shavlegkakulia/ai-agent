export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

export type SplitStrategy = 'none' | 'recursive' | 'semantic';

export const SPLIT_STRATEGIES: SplitStrategy[] = [
  'none',
  'recursive',
  'semantic',
];

export type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  userId: string;
  version: number;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
};

export type DocumentWriteRequest = {
  title: string;
  content: string;
  splitStrategy: SplitStrategy;
};
