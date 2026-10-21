import { ChatOpenAI } from '@langchain/openai';
import { queryRewriterPrompt } from '../promts';
import { z } from 'zod';
import { LangfuseService } from '../../langfuse/observability/observability.service';
import { Injectable } from '@nestjs/common';

const responseSchema = z.object({
  query: z.string(),
});

@Injectable()
export class QueryRewriterService {
  private readonly queryRewriter: ChatOpenAI;
  constructor(private readonly langfuseService: LangfuseService) {
    this.queryRewriter = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });
  }

  async rewriteQuery(query: string, chatId: string, userId: string) {
    const response = this.queryRewriter.withStructuredOutput(responseSchema, {
      strict: true,
    });

    const langfuseHandler = this.langfuseService.createHandler({
      sessionId: chatId,
      userId,
      tags: ['query-rewriter'],
    });
    const result = await response.invoke(
      [
        { role: 'user', content: query },
        {
          role: 'system',
          content: queryRewriterPrompt,
        },
      ],
      {
        callbacks: [langfuseHandler],
      },
    );

    return result.query;
  }
}
