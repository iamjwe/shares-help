import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { addDay, getNowDate } from '@/utils/date';
import { StockSelectNotifyType } from '@/service-notify/src/notify.service';
import TushareData from '../tushare.data';
import LimitStockSelect from './stock/limit.stock_select';

// 日买日卖、受大盘影响
@Injectable()
export default class ScheduleSelect {
  constructor(
    public readonly tushareData: TushareData,
    public readonly limitStockSelect: LimitStockSelect,
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
  ) {}

  // @Cron('60 * * * * *')
  @Cron('0 30 20 * * 1-5') // 八点半推送当日选股
  async dailyNotify() {
    // 如果当天是交易日，回测当天结果，给出下一个交易日建议
    const tradeCal = await this.tushareData.getTradeCal();
    // const nowDate = '20220304';
    const nowDate = getNowDate();
    const afterDay = addDay(nowDate);
    const isTradeDay = tradeCal[nowDate].is_open === 1;
    if (isTradeDay) {
      const adviseCodes = await this.limitStockSelect.start_core(afterDay);
      await this.notifyClient.emit('stock_select', adviseCodes);
    }
  }
}
