import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderController } from './order.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController, OrderController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
