import { Module } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (!url) {
          throw new Error('DATABASE_URL is not set');
        }
        const adapter = new PrismaPg({ connectionString: url });
        return new PrismaClient({ adapter });
      },
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}
