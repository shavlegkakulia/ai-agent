import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaClient) {}

  async getCustomers() {
    return this.prisma.customer.findMany();
  }
}
