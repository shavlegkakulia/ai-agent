import { Body, Controller, Post, Res, Request } from '@nestjs/common';
import { EvalDatasetGenerationService } from './eval-dataset-generation.service';
import { Response } from 'express';
import { AuthRequest } from 'types/auth';
import { GenerateEvalDatasetDto } from './index.dto';

@Controller('eval-dataset-generation')
export class EvalDatasetGenerationController {
  constructor(
    private readonly evalDatasetGenerationService: EvalDatasetGenerationService,
  ) {}

  @Post()
  async generateEvalCSVDataset(
    @Body() body: GenerateEvalDatasetDto,
    @Request() req: AuthRequest,
    @Res() res: Response<string>,
  ) {
    const items =
      await this.evalDatasetGenerationService.generateEvalCSVDataset(
        body.documentIds,
        req.user.id,
      );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="eval-dataset.csv"',
    );
    res.send(items);
  }
}
