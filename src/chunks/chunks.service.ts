import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class ChunksService {
  constructor(private readonly prisma: PrismaClient) {}

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
