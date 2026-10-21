import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentProcessor } from './document/worker/document.processor';
import { DocumentModule } from './document/document.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { QueueName } from './document/document-queue.contracts';
import { OutboxPublisher } from './document/worker/outbox-publisher';
import { TextSplitterModule } from './textSplitter/text-splitter.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: QueueName.DOCUMENT,
    }),
    PrismaModule,
    DocumentModule,
    EmbeddingModule,
    TextSplitterModule,
  ],
  providers: [DocumentProcessor, OutboxPublisher],
})
export class WorkerModule {}
