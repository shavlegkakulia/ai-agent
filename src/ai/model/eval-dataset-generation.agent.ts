import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EvalDatasetGenerationAgent {
  private readonly evalDatasetGenerationAgent: ChatOpenAI;
  constructor() {
    this.evalDatasetGenerationAgent = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });
  }

  get agent() {
    return this.evalDatasetGenerationAgent;
  }
}
