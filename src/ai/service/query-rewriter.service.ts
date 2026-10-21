import { ChatOpenAI } from '@langchain/openai';
import { queryRewriterPrompt } from '../promts';
import { z } from 'zod';

const responseSchema = z.object({
  query: z.string(),
});

export class QueryRewriterService {
  private readonly queryRewriter: ChatOpenAI;
  constructor() {
    this.queryRewriter = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });
  }

  async rewriteQuery(query: string) {
    const response = this.queryRewriter.withStructuredOutput(responseSchema, {
      strict: true,
    });
    const result = await response.invoke([
      { role: 'user', content: query },
      {
        role: 'system',
        content: queryRewriterPrompt,
      },
    ]);

    return result.query;
  }
}
