import { Module } from '@nestjs/common';
import { AgentService } from './service/agent.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MainAgent } from './agent/mian.agent';
import { ToolModule } from './tool.module';
import { QueryRewriterModule } from './query-rewriter.module';
import { ObservabilityModule } from '../langfuse/observability/observability.module';

@Module({
  imports: [PrismaModule, ToolModule, QueryRewriterModule, ObservabilityModule],
  providers: [AgentService, MainAgent],
  exports: [AgentService, MainAgent],
})
export class AgentModule {}
