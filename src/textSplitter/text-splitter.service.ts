import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { LangfuseService } from '../langfuse/observability/observability.service';
import { z } from 'zod';
import { SemanticTextSplitterAgent } from '../ai/model/semantic-text-splitter.agent';
import { semanticTextSplitterPrompt } from '../ai/promts';

const SemanticSplitSchema = z.object({
  chunks: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
});
@Injectable()
export class TextSplitterService {
  private readonly textSplitter: RecursiveCharacterTextSplitter;

  constructor(
    private readonly langfuseService: LangfuseService,
    private readonly semanticTextSplitterAgent: SemanticTextSplitterAgent,
  ) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 250,
    });
  }

  splitText(text: string) {
    return this.textSplitter.splitText(text);
  }

  async semanticSplitDocument(
    document: string,
    sessionId: string,
    userId: string,
  ): Promise<{ title: string; content: string }[]> {
    try {
      const langfuseHandler = this.langfuseService.createHandler({
        sessionId,
        userId,
        tags: ['document-processing', 'semantic-splitter'],
      });
      const semanticTextSplitter =
        this.semanticTextSplitterAgent.agent.withStructuredOutput(
          SemanticSplitSchema,
          {
            strict: true,
          },
        );
      const response = await semanticTextSplitter.invoke(
        [
          { role: 'user', content: document },
          {
            role: 'system',
            content: semanticTextSplitterPrompt,
          },
        ],
        {
          callbacks: [langfuseHandler],
        },
      );
      return response.chunks;
    } catch (error) {
      console.error('Error semantic splitting document', error);
      throw error;
    }
  }
}
