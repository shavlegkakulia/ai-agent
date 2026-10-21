import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaClient) {}

  getDocumentOutboxEvents(documentId: string, userId: string) {
    return this.prisma.outboxEvents.findMany({
      where: {
        aggregateId: documentId,
        document: {
          userId: userId,
        },
      },
      include: {
        document: true,
      },
    });
  }

  getAllOutboxEvents(userId: string) {
    return this.prisma.outboxEvents.findMany({
      where: {
        document: {
          userId: userId,
        },
      },
      include: {
        document: true,
      },
    });
  }
}
