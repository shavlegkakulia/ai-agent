import { Module } from '@nestjs/common';
import { AgentTools } from './agent.tools';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmbeddingModule } from '../../embedding/embedding.module';
import { DocumentModule } from '../../document/document.module';
import { RerankerAgent } from '../model/reranker.agent';

@Module({
  imports: [PrismaModule, EmbeddingModule, DocumentModule],
  providers: [AgentTools, RerankerAgent],
  exports: [AgentTools],
})
export class ToolModule {}
