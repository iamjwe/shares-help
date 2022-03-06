import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { addDay, getNowDate } from '@/utils/date';
import { StockBackTestNotifyType } from '@/service-notify/src/notify.service';
import LimitStockBackTest from './stock/limit.stock_backTest';
import TushareData from '../tushare.data';
import LimitStockSelect from '../shares-select/stock/limit.stock_select';
import SharesBackTestUtil from './shares_backTest.util';

// 日买日卖、受大盘影响
@Injectable()
export default class ScheduleBackTest {
  constructor(
    public readonly tushareData: TushareData,
    public readonly sharesBackTestUtil: SharesBackTestUtil,
    public readonly limitStockBackTest: LimitStockBackTest,
    public readonly limitStockSelect: LimitStockSelect,
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
  ) {}

  // @Cron('60 * * * * *')
  @Cron('0 30 17 * * 1-5') // 数据库于五点更新、缓存与五点十五更新、五点半回测
  async dailyNotify() {
    // 如果当天是交易日，回测当天结果，给出下一个交易日建议
    const tradeCal = await this.tushareData.getTradeCal();
    const nowDate = getNowDate();
    // const nowDate = '20220304';
    const isTradeDay = tradeCal[nowDate].is_open === 1;
    if (isTradeDay) {
      const lastTradeDate = (
        await this.sharesBackTestUtil.utilGetBeforeTradeDates(nowDate, 1)
      )[0]; // 上一个交易日
      const backTestOneDayResult = await this.limitStockBackTest.start_core({
        date: lastTradeDate,
      });
      const obj = {};
      const ts_codes = Object.keys(backTestOneDayResult);
      console.log(backTestOneDayResult);
      ts_codes.forEach((ts_code) => {
        const profit_hold =
          backTestOneDayResult[ts_code] === null
            ? '未买入'
            : backTestOneDayResult[ts_code].profit_hold;
        obj[ts_code] = profit_hold;
      });
      const notifyObj: StockBackTestNotifyType = obj;
      await this.notifyClient.emit('stock_backTest', notifyObj);
    }
  }
}
