import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('order')
export class OrderController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllOrders() {
    return await this.productService.getAllOrders();
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    return await this.productService.getOrderById(orderId);
  }

  @Get('by-product/:productId')
  async getOrderByProductId(@Param('productId') productId: string) {
    return await this.productService.getOrderByProductId(productId);
  }
}
