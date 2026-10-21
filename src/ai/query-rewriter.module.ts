import { Module } from '@nestjs/common';
import { QueryRewriterService } from './service/query-rewriter.service';
import { ObservabilityModule } from '../langfuse/observability/observability.module';

@Module({
  imports: [ObservabilityModule],
  providers: [QueryRewriterService],
  exports: [QueryRewriterService],
})
export class QueryRewriterModule {}
