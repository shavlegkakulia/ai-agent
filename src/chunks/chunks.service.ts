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

  getAllChunks(userId: string) {
    return this.prisma.documentChunks.findMany({
      where: {
        userId: userId,
      },
    });
  }
}
