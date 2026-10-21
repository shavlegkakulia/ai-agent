import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private readonly embeddings: OpenAIEmbeddings;
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
      dimensions: 1536,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  embedDocuments(chunks: string[]) {
    return this.embeddings.embedDocuments(chunks);
  }

  embedQuery(query: string) {
    return this.embeddings.embedQuery(query);
  }

  async generateEmbeddings(chunks: string[]) {
    return await this.embedDocuments(chunks);
  }
}
