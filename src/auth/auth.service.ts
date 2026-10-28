import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { UserService } from '../user/user.service';
import { UserDTO } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConstants } from './constants';
import { AuthRequest } from 'types/auth';
import type { SignOptions } from 'jsonwebtoken';
import { TokensService } from '../tokens/tokens.service';
import { bcryptCompare, bcryptHash, hashString } from '../helper/crypto.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
  ) {}
  async register(data: UserDTO) {
    try {
      const userData = {
        ...data,
        password: await bcryptHash(data.password),
      };
      const user = await this.userService.create(userData);
      return user;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('User already exists');
      }
      throw error;
    }
  }

  async login(user: AuthRequest['user']) {
    const tokens = await this.generateToken(user.email, user.id);
    await this.tokensService.createRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const hashedRefreshToken = hashString(refreshToken);
    const tokenId = await this.tokensService.findRefreshToken(
      userId,
      hashedRefreshToken,
    );
    if (!tokenId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.tokensService.deleteRefreshToken(tokenId.id);
    return {
      message: 'Logged out successfully',
    };
  }

  async refresh(req: AuthRequest) {
    const refreshToken = this.extractTokenFromHeader(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const hashedRefreshToken = hashString(refreshToken);
    const currentRefreshToken = await this.tokensService.findRefreshToken(
      req.user.id,
      hashedRefreshToken,
    );

    if (!currentRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (currentRefreshToken.revoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (currentRefreshToken) {
      await this.tokensService.revokeRefreshToken(currentRefreshToken.id);
    }

    return this.generateToken(req.user.email, req.user.id);
  }

  async generateToken(email: string, user_id: string) {
    const payload = { username: email, sub: user_id };
    const refreshToken = this.jwtService.sign(payload, {
      secret: JwtConstants.refreshSecret,
      expiresIn: JwtConstants.refreshExpirationTime as SignOptions['expiresIn'],
    });
    const accessToken = this.jwtService.sign(payload);
    const hashedRefreshToken = hashString(refreshToken);
    await this.tokensService.createRefreshToken(user_id, hashedRefreshToken);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }
    const { password: userPassword, ...rest } = user;
    const isPasswordValid = await bcryptCompare(password, userPassword);

    if (user && isPasswordValid) {
      return rest;
    }
    return null;
  }

  extractTokenFromHeader(request: AuthRequest) {
    try {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    } catch (error: unknown) {
      return null;
    }
  }
}
