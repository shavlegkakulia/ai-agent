import { Module } from '@nestjs/common';
import { minutes, seconds } from '@nestjs/throttler';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'auth-short', ttl: seconds(1), limit: 3 },
      { name: 'medium', ttl: seconds(10), limit: 20 },
      { name: 'long', ttl: minutes(1), limit: 100 },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class ThorttlerModule {}
