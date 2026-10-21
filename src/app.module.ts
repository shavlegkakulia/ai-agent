import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './ai/agent.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TokensModule } from './tokens/tokens.module';
import { BullModule } from '@nestjs/bullmq';
import { DocumentModule } from './document/document.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { ChunksModule } from './chunks/chunks.module';
import { OutboxModule } from './outbox/outbox.module';
import { ThorttlerModule } from './thorttler/thorttler.module';
import { ChatModule } from './chat/chat.module';
import { ProductModule } from './product/product.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    AgentModule,
    AuthModule,
    UserModule,
    TokensModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    DocumentModule,
    EmbeddingModule,
    ChunksModule,
    OutboxModule,
    ThorttlerModule,
    ChatModule,
    ProductModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
