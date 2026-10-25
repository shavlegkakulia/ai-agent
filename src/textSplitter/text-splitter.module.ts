import { Module } from '@nestjs/common';
import { TextSplitterService } from './text-splitter.service';
import { ObservabilityModule } from '../langfuse/observability/observability.module';
import { SemanticTextSplitterAgent } from '../ai/model/semantic-text-splitter.agent';

@Module({
  imports: [ObservabilityModule],
  providers: [TextSplitterService, SemanticTextSplitterAgent],
  exports: [TextSplitterService, SemanticTextSplitterAgent],
})
export class TextSplitterModule {}
