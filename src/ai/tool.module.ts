import { Module } from '@nestjs/common';
import { AgentTools } from './tools/agent.tools';
import { PrismaModule } from '../prisma/prisma.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [PrismaModule, EmbeddingModule, DocumentModule],
  providers: [AgentTools],
  exports: [AgentTools],
})
export class ToolModule {}
