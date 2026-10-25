import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryRewriteAgent {
  private readonly queryRewriter: ChatOpenAI;
  constructor() {
    this.queryRewriter = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });
  }

  get agent() {
    return this.queryRewriter;
  }
}
