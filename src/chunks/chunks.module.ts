import { Module } from '@nestjs/common';
import { ChunksService } from './chunks.service';
import { ChunksController } from './chunks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxModule } from '../outbox/outbox.module';

@Module({
  imports: [PrismaModule, OutboxModule],
  controllers: [ChunksController],
  providers: [ChunksService],
  exports: [ChunksService],
})
export class ChunksModule {}
