import { api } from './client';
import type { GenerateEvalDatasetRequest } from './types/evalDataset';

export function generateEvalDataset(body: GenerateEvalDatasetRequest) {
  return api
    .post<string>('/eval-dataset-generation', body, {
      responseType: 'text',
      transformResponse: [(data) => data],
    })
    .then((response) => response.data);
}
