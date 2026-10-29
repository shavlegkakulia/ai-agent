import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '../generated/prisma/client';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaClient) {}

  async addEvent(
    type: string,
    aggregateId: string,
    payload: Prisma.InputJsonValue,
    db?: Prisma.TransactionClient,
  ) {
    const dtb = db || this.prisma;
    return await dtb.outboxEvents.create({
      data: {
        type: type,
        aggregateId: aggregateId,
        payload: payload,
      },
    });
  }

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
