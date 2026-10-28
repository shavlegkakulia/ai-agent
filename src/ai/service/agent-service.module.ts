import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MainAgent } from '../agent/mian.agent';
import { QueryRewriterModule } from '../../query-rewrite/query-rewriter.module';
import { ObservabilityModule } from '../../langfuse/observability/observability.module';
import { ToolModule } from '../tools/tool.module';
import { DocumentModule } from '../../document/document.module';
import { PiiMiddlewareFactory } from '../middleware/ppiMidlewareFactory';
import { CustomerModule } from '../../customer/customer.module';
import { PiiModule } from '../../pii/pii.module';

@Module({
  imports: [
    PrismaModule,
    ToolModule,
    QueryRewriterModule,
    ObservabilityModule,
    DocumentModule,
    CustomerModule,
    PiiModule,
  ],
  providers: [AgentService, MainAgent, PiiMiddlewareFactory],
  exports: [AgentService, MainAgent],
})
export class AgentModule {}
