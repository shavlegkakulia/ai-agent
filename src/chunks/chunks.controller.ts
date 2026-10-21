import { Controller, Get, Param, Request } from '@nestjs/common';
import { ChunksService } from './chunks.service';
import { AuthRequest } from 'types/auth';

@Controller('chunks')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Get(':documentId')
  getChunksForDocument(
    @Param('documentId') documentId: string,
    @Request() req: AuthRequest,
  ) {
    return this.chunksService.getChunksForDocument(documentId, req.user.id);
  }

  @Get()
  getAllChunks(@Request() req: AuthRequest) {
    return this.chunksService.getAllChunks(req.user.id);
  }
}
