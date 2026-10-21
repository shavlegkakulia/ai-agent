import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

const bootstrap = async () => {
  await NestFactory.createApplicationContext(WorkerModule);
};

bootstrap();
