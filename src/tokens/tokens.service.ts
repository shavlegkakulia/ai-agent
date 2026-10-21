import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaClient) {}
  listRefreshTokens() {
    return this.prisma.refreshToken.findMany({});
  }

  async findRefreshToken(userId: string, token: string) {
    const currentRefreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: userId,
        token: token,
      },
    });
    if (!currentRefreshToken) {
      return null;
    }
    return currentRefreshToken;
  }

  async revokeRefreshToken(tokenId: string) {
    await this.prisma.refreshToken.update({
      where: {
        id: tokenId,
      },
      data: {
        revoked: true,
      },
    });
  }

  deleteRefreshToken(tokenId: string) {
    return this.prisma.refreshToken.delete({
      where: {
        id: tokenId,
      },
    });
  }

  async createRefreshToken(userId: string, token: string) {
    return await this.prisma.refreshToken.create({
      data: {
        userId: userId,
        token: token,
      },
    });
  }
}
