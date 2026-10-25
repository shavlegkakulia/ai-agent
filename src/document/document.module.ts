import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueName } from './document-queue.contracts';
import { ThorttlerModule } from '../thorttler/thorttler.module';
import { QueryRewriterModule } from '../query-rewrite/query-rewriter.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.DOCUMENT,
    }),
    PrismaModule,
    ThorttlerModule,
    QueryRewriterModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
