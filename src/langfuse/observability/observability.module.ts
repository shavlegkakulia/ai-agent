import { Module } from '@nestjs/common';
import { LangfuseService } from './observability.service';

@Module({
  providers: [LangfuseService],
  exports: [LangfuseService],
})
export class ObservabilityModule {}
