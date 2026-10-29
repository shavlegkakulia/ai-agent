import { Injectable } from '@nestjs/common';
import { DocumentStatus, PrismaClient } from '../generated/prisma/client';
import { JobName } from './contracts';
import { SplitStrategy } from '../textSplitter/constant';
import { buildFtsQuery } from '../helper/factory';
import { QueryRewriterService } from '../query-rewrite/query-rewriter.service';
import { OutboxService } from '../outbox/outbox.service';

const goldenDistanceThreshold = 0.7;

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly queryRewriterService: QueryRewriterService,
    private readonly outboxService: OutboxService,
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

  getDocumentsTitles() {
    return this.prisma.documents.findMany({
      select: {
        title: true,
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

      await this.outboxService.addEvent(
        JobName.PROCESS_DOCUMENT,
        document.id,
        {
          userId: userId,
          documentId: document.id,
          version: document.version,
          splitStrategy,
        },
        tx,
      );
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
      await this.outboxService.addEvent(
        JobName.UPDATE_DOCUMENT,
        document.id,
        {
          userId: userId,
          documentId: document.id,
          version: document.version,
          splitStrategy,
        },
        tx,
      );

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
