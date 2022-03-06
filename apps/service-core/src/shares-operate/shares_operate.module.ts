import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import SharesOperateController from './shares_operate.controller';
import TushareData from '../tushare.data';
import { ScheduleModule } from '@nestjs/schedule';
import LimitStockOperate from './stock/limit.stock_operate';
import SharesOperateUtil from './shares_operate.util';

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
  providers: [TushareData, SharesOperateUtil, LimitStockOperate],
  exports: [SharesOperateUtil, LimitStockOperate],
  controllers: [SharesOperateController],
})
export default class SharesOperateModule {}
