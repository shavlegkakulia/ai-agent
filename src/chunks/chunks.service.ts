import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DocumentStatus,
  Prisma,
  PrismaClient,
} from '../generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { OutboxService } from '../outbox/outbox.service';
import { JobName } from '../document/contracts';
import { SplitStrategy } from '../textSplitter/constant';

@Injectable()
export class ChunksService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxService: OutboxService,
  ) {}

  createChunksForDocument(
    documentId: string,
    userId: string,
    content: string,
    chunkIndex: number,
    embedding: string,
    db?: Prisma.TransactionClient,
  ) {
    const dtb = db || this.prisma;
    return dtb.$executeRaw`
      INSERT INTO DocumentChunks (  
            "id",
            "content",
            "userId",
            "documentId",
            "chunkIndex",
            "embedding",
            "createdAt")
      VALUES (${randomUUID()}, ${content}, ${userId}, ${documentId}, ${chunkIndex}, ${embedding}::vector, NOW())`;
  }

  async rechunkDocument(
    documentId: string,
    userId: string,
    version: number = 1,
    splitStrategy: SplitStrategy = SplitStrategy.Split,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const document = await tx.documents.updateManyAndReturn({
        where: {
          id: documentId,
          userId: userId,
          status: {
            in: [DocumentStatus.FAILED, DocumentStatus.READY],
          },
        },
        data: {
          status: DocumentStatus.PENDING,
        },
      });
      if (document.length === 0) {
        throw new NotFoundException('No documents found');
      }
      console.log('document', document);
      await this.outboxService.addEvent(
        JobName.RECHUNK_DOCUMENT,
        documentId,
        {
          userId: userId,
          documentId: documentId,
          version: version,
          splitStrategy,
        },
        tx,
      );

      return document;
    });
  }

  getChunksForDocument(documentId: string, userId: string) {
    return this.prisma.documentChunks.findMany({
      where: {
        documentId: documentId,
        userId: userId,
      },
    });
  }

  getChunksForDocuments(documentIds: string[], userId: string) {
    return this.prisma.documentChunks.findMany({
      where: {
        documentId: { in: documentIds },
        userId: userId,
      },
    });
  }

  getAllChunks(userId: string) {
    return this.prisma.documentChunks.findMany({
      where: {
        userId: userId,
      },
    });
  }

  deleteAllChunks(documentId: string, userId: string) {
    return this.prisma.documentChunks.deleteMany({
      where: {
        userId: userId,
        documentId: documentId,
      },
    });
  }
}
