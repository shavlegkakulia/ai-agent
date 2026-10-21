import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './Strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './Constants';
import { JwtStrategy } from './Strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { JwtRefreshAuthStrategy } from './Strategies/jwt-refresh.strategy';
import type { SignOptions } from 'jsonwebtoken';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    PassportModule,
    TokensModule,
    JwtModule.register({
      secret: JwtConstants.secret,
      signOptions: {
        expiresIn: JwtConstants.expirationTime as SignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
