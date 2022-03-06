import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import SharesBackTestController from './shares_backTest.controller';
import TushareData from '../tushare.data';
import { ScheduleModule } from '@nestjs/schedule';
import LimitStockBackTest from './stock/limit.stock_backTest';
import SharesBackTestUtil from './shares_backTest.util';
import LimitStockSelect from '../shares-select/stock/limit.stock_select';
import LimitStockOperate from '../shares-operate/stock/limit.stock_operate';
import SharesSelectModule from '../shares-select/shares_select.module';
import SharesOperateModule from '../shares-operate/shares_operate.module';
import ScheduleBackTest from './schedule.backTest';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5000,
      max: 10000,
    }),
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'SERVICE_DATA',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const { port } = config.get('data.tcp');
          return {
            transport: Transport.TCP,
            options: {
              port,
            },
          };
        },
      },
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
    SharesSelectModule,
    SharesOperateModule,
  ],
  providers: [
    TushareData,
    SharesBackTestUtil,
    LimitStockSelect,
    LimitStockOperate,
    LimitStockBackTest,
    ScheduleBackTest,
  ],
  controllers: [SharesBackTestController],
})
export default class SharesBackTestModule {}
