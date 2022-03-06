import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import SharesSelectController from './shares_select.controller';
import SharesSelectUtil from './shares_select.util';
import TushareData from '../tushare.data';
import { ScheduleModule } from '@nestjs/schedule';
import LimitThsSelect from './ths/limit.ths_select';
import LimitStockSelect from './stock/limit.stock_select';
import ScheduleSelect from './schedule.select';

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
  ],
  providers: [
    TushareData,
    SharesSelectUtil,
    LimitThsSelect,
    LimitStockSelect,
    ScheduleSelect,
  ],
  exports: [SharesSelectUtil, LimitThsSelect, LimitStockSelect],
  controllers: [SharesSelectController],
})
export default class SharesSelectModule {}
