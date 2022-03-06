import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DataModule } from './data.module';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { createConnection } from 'typeorm';

// 创建数据库（如果不存在）
const initDatabase = async (config) => {
  const { type, host, port, username, password, database } = config;
  const connection = await createConnection({
    type,
    host,
    port,
    username,
    password,
  });
  await connection.query(`create database if not exists ${database}`);
  await connection.close();
};

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
  await initDatabase(config.data.db.mysql);
  const { port } = config.data.tcp;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DataModule,
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
