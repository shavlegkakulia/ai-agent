import { Module } from '@nestjs/common';
import { EvalDatasetGenerationService } from './eval-dataset-generation.service';
import { EvalDatasetGenerationController } from './eval-dataset-generation.controller';
import { EvalDatasetGenerationAgent } from '../ai/model/eval-dataset-generation.agent';
import { ObservabilityModule } from '../langfuse/observability/observability.module';
import { ChunksModule } from '../chunks/chunks.module';
import { CsvModule } from '../csv/csv.module';

@Module({
  imports: [ObservabilityModule, ChunksModule, CsvModule],
  controllers: [EvalDatasetGenerationController],
  providers: [EvalDatasetGenerationService, EvalDatasetGenerationAgent],
  exports: [EvalDatasetGenerationService, EvalDatasetGenerationAgent],
})
export class EvalDatasetGenerationModule {}
