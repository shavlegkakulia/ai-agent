import { Injectable, NotFoundException } from '@nestjs/common';
import { EvalDatasetGenerationAgent } from '../ai/model/eval-dataset-generation.agent';
import { ChunksService } from '../chunks/chunks.service';
import { z } from 'zod';
import { LangfuseService } from '../langfuse/observability/observability.service';
import { CsvService } from '../csv/csv.service';
import { evalDatasetGenerationPrompt } from '../ai/promts';
import { DocumentChunks } from '../generated/prisma/client';

const EvalDatasetGenerationSchema = z.object({
  items: z
    .array(
      z.object({
        input: z.object({
          question: z.string(),
        }),
        expectedOutput: z.string(),
        expectedChunks: z.array(
          z.object({
            documentId: z.string(),
            chunkId: z.string(),
            chunkContent: z.string(),
          }),
        ),
      }),
    )
    .min(8),
});

@Injectable()
export class EvalDatasetGenerationService {
  constructor(
    private readonly evalDatasetGenerationAgent: EvalDatasetGenerationAgent,
    private readonly chunkService: ChunksService,
    private readonly langfuseService: LangfuseService,
    private readonly csvService: CsvService,
  ) {}

  async generateEvalCSVDataset(documentIds: string[], userId: string) {
    const chunks: DocumentChunks[] =
      await this.chunkService.getChunksForDocuments(documentIds, userId);

    if (chunks.length === 0) {
      throw new NotFoundException('No chunks found for documents');
    }
    const chunkIds = chunks.map((chunk) => chunk.id);
    const isRealId = (chunk: { chunkId: string }) =>
      chunkIds.includes(chunk.chunkId);

    const chunkContent = chunks
      .map(
        (chunk) => `
        id: ${chunk.id},
        documentId: ${chunk.documentId},
        content: ${chunk.content},
      `,
      )
      .join('\n');
    const langfuseHandler = this.langfuseService.createHandler({
      sessionId: [...documentIds].sort().join(','),
      userId,
      tags: ['eval-dataset-generation'],
    });
    const response = await this.evalDatasetGenerationAgent.agent
      .withStructuredOutput(EvalDatasetGenerationSchema, {
        strict: true,
      })
      .invoke(
        [
          {
            role: 'system',
            content: evalDatasetGenerationPrompt,
          },
          {
            role: 'user',
            content: `Here is the content of the document chunks: ${chunkContent}`,
          },
        ],
        {
          callbacks: [langfuseHandler],
        },
      );
    const invalidChunks: string[] = [];
    for (const item of response.items) {
      for (const chunk of item.expectedChunks) {
        if (!isRealId(chunk)) {
          invalidChunks.push(chunk.chunkId);
        }
      }
    }
    if (invalidChunks.length > 0) {
      throw new Error(`Invalid chunk IDs: ${invalidChunks.join(', ')}`);
    }
    return this.csvService.generateCsv(response.items, [
      'input.question',
      'expectedOutput',
      'expectedChunks',
    ]);
  }
}
