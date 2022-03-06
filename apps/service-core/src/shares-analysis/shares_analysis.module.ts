import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import SharesAnalysisController from './shares_analysis.controller';
import TushareData from '../tushare.data';
import { ScheduleModule } from '@nestjs/schedule';
import AmplitudeStockAnalysis from './stock/amplitude.stock_analysis';
import SharesAnalysisUtil from './shares_analysis.util';

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
  providers: [TushareData, SharesAnalysisUtil, AmplitudeStockAnalysis],
  controllers: [SharesAnalysisController],
})
export default class SharesAnalysisModule {}
