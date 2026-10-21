import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { AuthRequest } from 'types/auth';
import { AuthThrottlerGuard } from '../auth/Guards/Auth-throttler.guard';
import { SplitStrategy } from '../textSplitter/strategies';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('add')
  addDocument(
    @Body()
    body: { title: string; content: string; splitStrategy: SplitStrategy },
    @Request() req: AuthRequest,
  ) {
    return this.documentService.addDocument(
      body.title,
      body.content,
      req.user.id,
      body.splitStrategy,
    );
  }

  @UseGuards(AuthThrottlerGuard)
  @Get()
  getDocuments(@Request() req: AuthRequest) {
    return this.documentService.getDocuments(req.user.id);
  }

  @Get(':documentId')
  getDocument(
    @Param('documentId') documentId: string,
    @Request() req: AuthRequest,
  ) {
    return this.documentService.getDocument(documentId, req.user.id);
  }

  @Delete(':documentId')
  deleteDocument(
    @Param('documentId') documentId: string,
    @Request() req: AuthRequest,
  ) {
    return this.documentService.deleteDocument(documentId, req.user.id);
  }

  @Put(':documentId')
  updateDocument(
    @Param('documentId') documentId: string,
    @Body()
    body: { title: string; content: string; splitStrategy: SplitStrategy },
    @Request() req: AuthRequest,
  ) {
    return this.documentService.updateDocumentContent(
      documentId,
      body.title,
      body.content,
      req.user.id,
      body.splitStrategy,
    );
  }

  @Get('pg/doc/:query')
  searchDocuments(@Param('query') query: string) {
    console.log(query ?? 'no query');
    return this.documentService.ftsSearch(query);
  }
}
