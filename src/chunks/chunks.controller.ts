import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ChunksService } from './chunks.service';
import { AuthRequest } from 'types/auth';
import { SplitStrategy } from 'src/textSplitter/constant';

@Controller('chunks')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Post(':documentId')
  createChunksForDocument(
    @Param('documentId') documentId: string,
    @Body('content') content: string,
    @Body('chunkIndex') chunkIndex: number,
    @Body('embedding') embedding: string,
    @Request() req: AuthRequest,
  ) {
    return this.chunksService.createChunksForDocument(
      documentId,
      req.user.id,
      content,
      chunkIndex,
      embedding,
    );
  }

  @Post(':documentId/rechunk')
  rechunkDocument(
    @Param('documentId') documentId: string,
    @Body('version') version: number,
    @Body('splitStrategy') splitStrategy: SplitStrategy,
    @Request() req: AuthRequest,
  ) {
    return this.chunksService.rechunkDocument(
      documentId,
      req.user.id,
      version,
      splitStrategy,
    );
  }

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

  @Delete(':documentId')
  deleteChunks(
    @Param('documentId') documentId: string,
    @Request() req: AuthRequest,
  ) {
    return this.chunksService.deleteAllChunks(documentId, req.user.id);
  }
}
