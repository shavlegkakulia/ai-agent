import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { DocumentService } from '../document.service';
import { EmbeddingService } from '../../embedding/embedding.service';
import { DocumentStatus, PrismaClient } from '../../generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { DocumentProcessorData, JobName, QueueName } from '../contracts';
import { SplitStrategy } from '../../textSplitter/constant';
import { TextSplitterService } from '../../textSplitter/text-splitter.service';

@Processor(QueueName.DOCUMENT)
export class DocumentProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly documentService: DocumentService,
    private readonly embeddingService: EmbeddingService,
    private readonly textSplitterService: TextSplitterService,
  ) {
    super();
  }
  async chunkDocument(
    data: DocumentProcessorData,
    operation: 'insert' | 'update' = 'insert',
  ) {
    const document = await this.documentService.getDocument(
      data.documentId,
      data.userId,
    );

    if (!document) {
      throw new UnrecoverableError(`Document not found: ${data.documentId}`);
    }

    if (document.version !== data.version) {
      return {}; // Mark as processed but do not process because stale data
    }

    if (document.status === DocumentStatus.READY) {
      return {};
    }

    if (
      document.status !== DocumentStatus.PENDING &&
      document.status !== DocumentStatus.PROCESSING
    ) {
      throw new Error(`Document is not pending: ${data.documentId}`);
    }

    const updatedDocument = await this.prisma.documents.updateManyAndReturn({
      where: { id: data.documentId, version: data.version },
      data: {
        status: DocumentStatus.PROCESSING,
      },
    });

    if (updatedDocument.length !== 1) {
      return {}; // Mark as processed but do not process because stale data
    }

    let splitChunks: string[] = [];

    if (data.splitStrategy === SplitStrategy.Split) {
      splitChunks = await this.textSplitterService.splitText(document.content);
    } else if (data.splitStrategy === SplitStrategy.Semantic) {
      const semanticChunks =
        await this.textSplitterService.semanticSplitDocument(
          document.content,
          data.documentId,
          data.userId,
        );

      splitChunks = semanticChunks.map(
        (chunk) =>
          `Chunk title: ${chunk.title.concat(chunk.title.endsWith('.') ? '' : '.')}\n\n  Chunk content: ${chunk.content}`,
      );
    } else {
      splitChunks = [document.content];
    }
    splitChunks = splitChunks.map(
      (chunk) => `Document title: ${document.title}\n\n  ${chunk}`,
    );

    const embeddings =
      await this.embeddingService.generateEmbeddings(splitChunks);

    if (!embeddings) {
      throw new Error('Failed to generate embeddings');
    }

    const embeddingsData = embeddings.map((embedding, index) => {
      return {
        content: splitChunks[index],
        embedding: embedding,
        chunkIndex: index,
      };
    });

    return await this.prisma.$transaction(async (tx) => {
      const currentDocument = await tx.documents.findUnique({
        where: {
          id: data.documentId,
          userId: data.userId,
        },
      });
      if (!currentDocument || currentDocument.version !== data.version) {
        return {}; // Mark as processed but do not process because stale data
      }
      if (operation === 'update') {
        await tx.documentChunks.deleteMany({
          where: {
            documentId: data.documentId,
          },
        });
      }
      for (const embedding of embeddingsData) {
        const vector = `[${embedding.embedding.join(',')}]`;
        await tx.$executeRaw`
          INSERT INTO "DocumentChunks" (
            "id",
            "content",
            "userId",
            "documentId",
            "chunkIndex",
            "embedding",
            "createdAt"
          )
          VALUES (
            ${randomUUID()},
            ${embedding.content},
            ${data.userId},
            ${data.documentId},
            ${embedding.chunkIndex},
            ${vector}::vector,
            NOW()
          )
        `;
      }
      await tx.documents.update({
        where: { id: data.documentId, version: data.version },
        data: {
          status: DocumentStatus.READY,
        },
      });

      return {};
    });
  }
  count = 0;
  async process(job: Job<DocumentProcessorData, unknown, string>) {
    const { data, name } = job;

    if (name === JobName.PROCESS_DOCUMENT) {
      return this.chunkDocument(data);
    } else if (name === JobName.UPDATE_DOCUMENT) {
      return this.chunkDocument(data, 'update');
    } else {
      throw new Error(`Invalid job name: ${name}`);
    }
  }
  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<DocumentProcessorData, unknown, string>,
    error: Error,
  ) {
    const isUnrecoverable = error instanceof UnrecoverableError;
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade >= maxAttempts || isUnrecoverable) {
      await this.prisma.documents.updateMany({
        where: { id: job.data.documentId, version: job.data.version },
        data: {
          status: DocumentStatus.FAILED,
        },
      });
    }
  }
}
