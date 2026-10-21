import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { createAgent, ReactAgent } from 'langchain';
import { LangfuseService } from '../langfuse/observability/observability.service';
import { z } from 'zod';

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
  private readonly semanticSplitAgent: ReactAgent;
  private readonly textSplitter: RecursiveCharacterTextSplitter;

  constructor(private readonly langfuseService: LangfuseService) {
    this.semanticSplitAgent = createAgent({
      name: 'SemanticSplitter',
      model: 'gpt-4o',
      responseFormat: SemanticSplitSchema,
      systemPrompt: `You are a semantic document splitter.

        Split the provided document into self-contained semantic chunks.

        Rules:
        - Start a new chunk only when the text moves to a meaningfully different topic, rule, condition, or business process.
        - Keep adjacent sentences together when they are needed to understand the same rule or process.
        - Do not create a new chunk merely because a paragraph or sentence ends.
        - Do not merge semantically independent rules only to reduce the number of chunks.
        - Do not split inside a sentence.

        - Preserve the chunk content exactly as it appears in the original document.
        - Do not correct grammar, spelling, punctuation, spacing, typos, malformed words, or stylistic issues.
        - If the original document contains an error, preserve that error exactly.
        - Never replace a word with a synonym or a semantically equivalent word.
        - Never rewrite a phrase to make it clearer, more natural, or grammatically correct.
        - Never paraphrase, summarize, normalize, or add words to the chunk content.
        - The only text you may generate yourself is the chunk title.
        - Generated titles must be stored only in the title field and must never be inserted into content.
        - Chunk content must contain only text taken from the original document.

        - Every original sentence must appear exactly once in the output.
        - Do not omit any conditions, exceptions, dates, identifiers, or business rules.
        - Return chunks in the same order as the original document.
        - Generate each chunk title in the same language as the original document.`,
    });
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
      const response = await this.semanticSplitAgent.invoke(
        {
          messages: [{ role: 'user', content: document }],
        },
        {
          callbacks: [langfuseHandler],
        },
      );
      return response.structuredResponse.chunks;
    } catch (error) {
      console.error('Error semantic splitting document', error);
      throw error;
    }
  }
}
