import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotifyModule } from './notify.module';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const readGlobalConfig = async () => {
  const config = (await yaml.load(
    readFileSync(
      join(`${process.cwd()}/apps`, process.env.CONFIG_FILE_NAME),
      'utf8',
    ),
  )) as Record<string, any>;
  return config;
};
async function bootstrap() {
  const config = await readGlobalConfig();
  const { port } = config.notify.tcp;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotifyModule,
    {
      transport: Transport.TCP,
      options: {
        port,
      },
    },
  );

  await app.listen();
}
bootstrap();
