import { queryRewriterPrompt } from '../ai/promts';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { QueryRewriteAgent } from '../ai/model/query-rewrite.agent';
import { LangfuseService } from '../langfuse/observability/observability.service';

const responseSchema = z.object({
  query: z.string(),
});

@Injectable()
export class QueryRewriterService {
  constructor(
    private readonly queryRewriteAgent: QueryRewriteAgent,
    private readonly langfuseService: LangfuseService,
  ) {}

  async rewriteQuery(query: string, chatId: string, userId: string) {
    const queryRewriter = this.queryRewriteAgent.agent.withStructuredOutput(
      responseSchema,
      {
        strict: true,
      },
    );

    const langfuseHandler = this.langfuseService.createHandler({
      sessionId: chatId,
      userId,
      tags: ['query-rewriter'],
    });

    const result = await queryRewriter.invoke(
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
