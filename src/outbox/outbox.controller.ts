import { Controller, Get, Param, Request } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { AuthRequest } from 'types/auth';

@Controller('outbox')
export class OutboxController {
  constructor(private readonly outboxService: OutboxService) {}

  @Get(':documentId')
  getDocumentOutboxEvents(
    @Param('documentId') documentId: string,
    @Request() req: AuthRequest,
  ) {
    return this.outboxService.getDocumentOutboxEvents(documentId, req.user.id);
  }

  @Get('all')
  getAllOutboxEvents(@Request() req: AuthRequest) {
    return this.outboxService.getAllOutboxEvents(req.user.id);
  }
}
