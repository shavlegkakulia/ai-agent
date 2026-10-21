import { Module } from '@nestjs/common';
import { QueryRewriterService } from './service/query-rewriter.service';

@Module({
  providers: [QueryRewriterService],
  exports: [QueryRewriterService],
})
export class QueryRewriterModule {}
