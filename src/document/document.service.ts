import { Injectable } from '@nestjs/common';
import { DocumentStatus, PrismaClient } from '../generated/prisma/client';
import { JobName } from './document-queue.contracts';
import { SplitStrategy } from '../textSplitter/strategies';
import { buildFtsQuery } from '../helper';
import { QueryRewriterService } from '../ai/service/query-rewriter.service';

const goldenDistanceThreshold = 0.7;

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly queryRewriterService: QueryRewriterService,
  ) {}

  getDocument(documentId: string, userId: string) {
    return this.prisma.documents.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });
  }

  async getDocuments(userId: string) {
    return this.prisma.documents.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async createDocument(
    title: string,
    content: string,
    userId: string,
    splitStrategy: SplitStrategy = SplitStrategy.Split,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.documents.create({
        data: {
          title,
          content,
          userId,
        },
        select: {
          id: true,
          version: true,
        },
      });
      await tx.outboxEvents.create({
        data: {
          type: JobName.PROCESS_DOCUMENT,
          aggregateId: document.id,
          payload: {
            userId: userId,
            documentId: document.id,
            version: document.version,
            splitStrategy,
          },
        },
      });
      return document;
    });
  }

  async updateDocument(
    documentId: string,
    title: string,
    content: string,
    userId: string,
    splitStrategy: SplitStrategy = SplitStrategy.Split,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.documents.update({
        data: {
          status: DocumentStatus.PENDING,
          title,
          content,
          version: {
            increment: 1,
          },
        },
        where: {
          id: documentId,
          userId,
        },
      });
      await tx.outboxEvents.create({
        data: {
          type: JobName.UPDATE_DOCUMENT,
          aggregateId: document.id,
          payload: {
            userId: userId,
            documentId: document.id,
            version: document.version,
            splitStrategy,
          },
        },
      });
      return document;
    });
  }

  async addDocument(
    title: string,
    content: string,
    userId: string,
    splitStrategy: SplitStrategy = SplitStrategy.Split,
  ) {
    const document = await this.createDocument(
      title,
      content,
      userId,
      splitStrategy,
    );

    return document.id;
  }

  async updateDocumentContent(
    documentId: string,
    title: string,
    content: string,
    userId: string,
    splitStrategy: SplitStrategy = SplitStrategy.Split,
  ) {
    const document = await this.updateDocument(
      documentId,
      title,
      content,
      userId,
      splitStrategy,
    );

    return document.id;
  }

  async deleteDocument(documentId: string, userId: string) {
    return this.prisma.documents.delete({
      where: {
        id: documentId,
        userId,
      },
    });
  }

  embeddingSimilaritySearch(rawEmbeddingString: string, limit: number = 5) {
    return this.prisma.$queryRaw<
      { id: string; content: string; distance: number; documentId: string }[]
    >`
    SELECT "id", "content", "embedding" <=> ${rawEmbeddingString}::vector AS distance, "documentId" FROM "DocumentChunks"
    where "embedding" <=> ${rawEmbeddingString}::vector < ${goldenDistanceThreshold}
    ORDER BY "distance" ASC
    LIMIT ${limit}
    `;
  }

  async ftsSearch(
    query: string,
    limit: number = 5,
    chatId: string,
    userId: string,
  ) {
    const rewrittenQuery = await this.queryRewriterService.rewriteQuery(
      query,
      chatId,
      userId,
    );
    const ftsQuery = buildFtsQuery(rewrittenQuery);

    return this.prisma.$queryRaw<
      { id: string; documentId: string; content: string; rank: number }[]
    >`
    SELECT
      "id",
      "documentId",
      "content",
      ts_rank(
        to_tsvector('simple', "content"),
        to_tsquery('simple', ${ftsQuery})
      ) AS rank
    FROM "DocumentChunks"
    WHERE
    to_tsvector('simple', "content")
      @@ to_tsquery('simple', ${ftsQuery})
    ORDER BY rank DESC
    LIMIT ${limit}`;
  }
}
