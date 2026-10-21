import { Module } from '@nestjs/common';
import { TextSplitterService } from './text-splitter.service';
import { ObservabilityModule } from '../langfuse/observability/observability.module';

@Module({
  imports: [ObservabilityModule],
  providers: [TextSplitterService],
  exports: [TextSplitterService],
})
export class TextSplitterModule {}
