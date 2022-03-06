import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import 'winston-daily-rotate-file';
import SharesSelectModule from './shares-select/shares_select.module';
import SharesAnalysisModule from './shares-analysis/shares_analysis.module';
import SharesOperateModule from './shares-operate/shares_operate.module';
import SharesBackTestModule from './shares-backTest/shares_backTest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [
        () => {
          return yaml.load(
            readFileSync(
              join(`${process.cwd()}/apps`, process.env.CONFIG_FILE_NAME),
              'utf8',
            ),
          ) as Record<string, any>;
        },
      ],
    }),
    ClientsModule.registerAsync([
      {
        name: 'SERVICE_NOTIFY',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const { port } = config.get('notify.tcp');
          return {
            transport: Transport.TCP,
            options: {
              port,
            },
          };
        },
      },
    ]),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          silent: config.get<boolean>('logger.silent'),
          exitOnError: config.get<boolean>('logger.exitOnError'),
          level: config.get<string>('logger.level'),
          // 由配置规则决定，是否把日志输出到文件中。（生产环境需要输出到文件中）
          transports: !!config.get<string>('logger.transports.logPath')
            ? [
                new winston.transports.Console(),
                // error日志收集到一个为文件
                new winston.transports.DailyRotateFile({
                  filename: `${config.get<string>(
                    'logger.transports.logPath',
                  )}/error/%DATE%.log`,
                  datePattern: 'YYYY-MM-DD-HH',
                  zippedArchive: true,
                  level: 'error',
                }),
                // 一般日志
                new winston.transports.DailyRotateFile({
                  dirname: config.get<string>('logger.transports.logPath'),
                  filename: '%DATE%.log',
                  datePattern: 'YYYY-MM-DD-HH',
                  zippedArchive: true, // 自动存档
                  maxSize: '20m', // 日志文件最大20m
                  maxFiles: '14d', // 一般日志，14天清理一次
                }),
              ]
            : [new winston.transports.Console()],
          // 由配置规则决定，只在开发环境下有颜色，防止输出到文件时乱码
          format: config.get<boolean>('logger.color')
            ? winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike(),
              )
            : winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike(),
                winston.format.uncolorize(),
              ),
        };
      },
    }),
    SharesAnalysisModule,
    SharesSelectModule,
    SharesOperateModule,
    SharesBackTestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
