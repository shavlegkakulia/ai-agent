import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaClient) {}

  async getProductById(productId: string) {
    return await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
  }
  async getAllProducts() {
    return await this.prisma.product.findMany();
  }

  async getOrderByProductId(productId: string) {
    return await this.prisma.order.findMany({
      where: {
        productId: productId,
      },
    });
  }

  async getOrderById(orderId: string) {
    return await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
  }

  async getAllOrders() {
    return await this.prisma.order.findMany();
  }
}
