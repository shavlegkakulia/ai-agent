import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaClient) {}

  async getCustomers() {
    return this.prisma.customer.findMany();
  }

  getCustomerRef(phone?: string, email?: string) {
    return this.prisma.customer.findFirst({
      where: {
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
      },
      select: {
        customerRef: true,
      },
    });
  }

  getCustomerByRef(ref: string) {
    return this.prisma.customer.findFirst({
      where: {
        customerRef: ref,
      },
      select: {
        phone: true,
        email: true,
      },
    });
  }
}
