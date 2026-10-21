import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { AuthRequest } from 'types/auth';
import { UserDTO } from '../auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  profile(user: AuthRequest['user']) {
    return this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        last_name: true,
      },
    });
  }

  async create(data: UserDTO) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        last_name: true,
      },
    });
  }
}
