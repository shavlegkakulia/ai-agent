import { CohereRerank } from '@langchain/cohere';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RerankerAgent {
  private reranker: CohereRerank;

  constructor() {
    this.reranker = new CohereRerank({
      apiKey: process.env.COHERE_API_KEY,
      model: 'rerank-v5.0-pro',
      topN: 5,
    });
  }

  get model() {
    return this.reranker;
  }
}
