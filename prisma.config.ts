import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
  experimental: {
    externalTables: true,
  },

  tables: {
    external: [
      'public.checkpoints',
      'public.checkpoint_blobs',
      'public.checkpoint_writes',
      'public.checkpoint_migrations',
    ],
  },
});
