import { CacheModule, Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import BaseData from './tushare/base.data';
import EtfData from './tushare/etf.data';
import IndexData from './tushare/index.data';
import StockData from './tushare/stock.data';
import { entities } from '@/tushare/entity.const';
import { BaseDataSync } from './tushare/base.sync';
import { EtfDataSync } from './tushare/etf.sync';
import { IndexDataSync } from './tushare/index.sync';
import { StockDataSync } from './tushare/stock.sync';
import { ThsDataSync } from './tushare/ths.sync';
import BaseDataUtil from './tushare/base.util';
import ThsData from './tushare/ths.data';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    CacheModule.register({
      ttl: 5000,
      max: 10000,
    }),
    ScheduleModule.forRoot(),
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
    // mysql模块：异步配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          entities: entities,
          keepConnectionAlive: true,
          ...config.get('data.db.mysql'),
        };
      },
    }),
  ],
  controllers: [DataController],
  providers: [
    BaseData,
    EtfData,
    IndexData,
    StockData,
    { provide: ThsData, useClass: ThsData },
    BaseDataSync,
    EtfDataSync,
    IndexDataSync,
    StockDataSync,
    ThsDataSync,
    BaseDataUtil,
  ],
})
export class DataModule {}
