import { Module } from '@nestjs/common';
import { PiiService } from './pii.service';

@Module({
  controllers: [],
  providers: [PiiService],
  exports: [PiiService],
})
export class PiiModule {}
