import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { createConnection } from 'typeorm';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from '@/service-core/src/aop/exceptionFilters/any-exceptions.filter';
import { HttpExceptionsFilter } from '@/service-core/src/aop/exceptionFilters/http-exceptions.filer';
import { loggerMiddleware } from '@/service-core/src/aop/middlewares/logger.middleware';
import * as helmet from 'helmet';
import * as csurf from 'csurf';

// 读取全局配置
const readGlobalConfig = async () => {
  const config = (await yaml.load(
    readFileSync(
      join(`${process.cwd()}/apps`, process.env.CONFIG_FILE_NAME),
      'utf8',
    ),
  )) as Record<string, any>;
  return config;
};

// 初始化swagger文档
const initSwagger = (app) => {
  const config = new DocumentBuilder()
    .setTitle('炒股助手')
    .setDescription('炒股助手API文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};

async function bootstrap() {
  const config = await readGlobalConfig();
  const app = await NestFactory.create(AppModule, {
    cors: config.app.cors, // 安全
  });
  const nestWinston = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // 日志
  app.useLogger(nestWinston);
  app.useGlobalFilters(new AllExceptionsFilter(nestWinston.logger));
  app.useGlobalFilters(new HttpExceptionsFilter(nestWinston.logger));
  app.use(loggerMiddleware(nestWinston.logger));
  // 安全
  app.use(helmet());
  config.app.swagger ? initSwagger(app) : app.use(csurf());
  await app.listen(config.http.port);
}
bootstrap();
