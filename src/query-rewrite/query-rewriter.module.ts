import { Module } from '@nestjs/common';
import { QueryRewriterService } from './query-rewriter.service';
import { ObservabilityModule } from '../langfuse/observability/observability.module';
import { QueryRewriteAgent } from '../ai/model/query-rewrite.agent';

@Module({
  imports: [ObservabilityModule],
  providers: [QueryRewriterService, QueryRewriteAgent],
  exports: [QueryRewriterService, QueryRewriteAgent],
})
export class QueryRewriterModule {}
