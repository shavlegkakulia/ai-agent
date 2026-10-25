import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SemanticTextSplitterAgent {
  private readonly semanticTextSplitterAgent: ChatOpenAI;
  constructor() {
    this.semanticTextSplitterAgent = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });
  }

  get agent() {
    return this.semanticTextSplitterAgent;
  }
}
