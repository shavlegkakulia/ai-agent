import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DocumentProcessorData, QueueName } from '../document-queue.contracts';
import { Queue } from 'bullmq';
import { PrismaClient } from '../../generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { OutboxEvents } from '../../generated/prisma/client';

@Injectable()
export class OutboxPublisher
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly instanceId = randomUUID();
  running: boolean = false;
  constructor(
    @InjectQueue(QueueName.DOCUMENT)
    private readonly bullQueue: Queue,
    private readonly prisma: PrismaClient,
  ) {}

  async publish() {
    if (this.running) {
      return;
    }

    this.running = true;

    while (this.running) {
      try {
        const unpublishedEvent = await this.prisma.$queryRaw<OutboxEvents[]>`
        WITH candidate AS (
          SELECT id
          FROM "OutboxEvents"
          WHERE "publishedAt" IS NULL
            AND (
              "owner" IS NULL
              OR (
                "owner" IS NOT NULL
                AND "ownedAt" <= NOW() - INTERVAL '30 seconds'
              )
            )
          ORDER BY "createdAt" ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        UPDATE "OutboxEvents" AS event
        SET
          owner = ${this.instanceId},
          "ownedAt" = NOW()
        FROM candidate
        WHERE event.id = candidate.id
        RETURNING
        event."id",
        event."type",
        event."payload",
        event."aggregateId"`;

        if (unpublishedEvent.length === 0) {
          await this.sleep(1000);
          continue;
        }

        const events = unpublishedEvent[0] as OutboxEvents & {
          payload: DocumentProcessorData;
        };

        try {
          await this.bullQueue.add(events.type, events.payload, {
            jobId: `processing-document-${events.aggregateId}-${events.payload.version}`,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          });

          await this.prisma.outboxEvents.updateMany({
            where: {
              id: events.id,
              owner: this.instanceId,
            },
            data: {
              publishedAt: new Date(),
              owner: null,
              ownedAt: null,
            },
          });
        } catch (error) {
          Logger.error(error);
          try {
            await this.prisma.outboxEvents.updateMany({
              where: { id: events.id, owner: this.instanceId },
              data: { attempts: { increment: 1 }, owner: null, ownedAt: null },
            });
          } catch (error) {
            Logger.error(error);
          }
          await this.sleep(1000);
        }
      } catch (error) {
        Logger.error(error);
        await this.sleep(1000);
      }
    }
  }
  onApplicationBootstrap() {
    void this.publish();
  }

  onApplicationShutdown() {
    this.running = false;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
