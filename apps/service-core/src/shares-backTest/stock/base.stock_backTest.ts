import { dateUnitEnum, getNowDate, substractDate } from '@/utils/date';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import BaseStockOperate from '../../shares-operate/stock/base.stock_operate';
import BaseStockSelect from '../../shares-select/stock/base.stock_select';
import TushareData from '../../tushare.data';
import {
  BackTestDateRangeResult,
  BackTestOneDayResult,
  OperateResult,
} from './type.stock_backTest';

/* 
  抽象部分：
    回测逻辑：如何选股以及如何操作都在constructor参数中声明了
    调仓周期：getTradeDateByDateRange
*/

@Injectable()
export default abstract class BaseStockBackTest {
  protected stockSelect: BaseStockSelect;
  protected stockOperate: BaseStockOperate;

  constructor(
    public readonly tushareData: TushareData,
    public readonly notifyClient: ClientProxy,
  ) {}

  protected abstract getTradeDateByDateRange(
    start_date: string,
    end_date: string,
  ): Promise<string[]>;

  protected async backTestOneDay(date: string): Promise<BackTestOneDayResult> {
    const backTestOneDayResult = {};
    const ts_codes = await this.stockSelect.start_core(date);
    const { buyInfo, sellInfo, holdInfo } = await this.stockOperate.start_core(
      ts_codes,
      date,
    );
    let avagProfit = 0; // 统计当日的平均收益
    ts_codes.forEach((ts_code: string) => {
      let backTestResult: OperateResult = null;
      if (buyInfo[ts_code]) {
        backTestResult = {
          percentage: buyInfo[ts_code].buyPercentage,
          date_buy: buyInfo[ts_code].buyDate,
          date_sell: sellInfo[ts_code].sellDate,
          price_buy: buyInfo[ts_code].buyPrice,
          price_sell: sellInfo[ts_code].sellPrice,
          profit_hold: holdInfo[ts_code].holdProfit,
        };
        avagProfit +=
          buyInfo[ts_code].buyPercentage * holdInfo[ts_code].holdProfit; // （仓位 * 收益率）之和
      }
      backTestOneDayResult[ts_code] = backTestResult;
    });
    // console.log(backTestOneDayResult);
    console.log(
      `日期${date}回测结束，买入标的: ${Object.keys(buyInfo).join(
        ',',
      )},平均收益率: ${avagProfit}`,
    );
    return backTestOneDayResult;
  }

  protected async backTestDateRange(
    start_date: string,
    end_date: string,
  ): Promise<BackTestDateRangeResult> {
    const backTestDateRangeResult = {};
    const trade_dates = await this.getTradeDateByDateRange(
      start_date,
      end_date,
    );
    for (let i = 0; i < trade_dates.length; i++) {
      const trade_date = trade_dates[i];
      const backTestOnedayResult = await this.backTestOneDay(trade_date);
      backTestDateRangeResult[trade_date] = backTestOnedayResult;
    }
    return backTestDateRangeResult;
  }

  public async start_core(params?: {
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<BackTestOneDayResult | BackTestDateRangeResult> {
    const beginTime = Number(new Date());
    const date = params?.date;
    if (date) {
      const backTestOneDayResult = await this.backTestOneDay(date);
      return backTestOneDayResult;
    } else {
      let { start_date, end_date } = params || {}; // 啥也不传默认回测上月初到今日
      // 回测一个时间范围：默认回测上个月初开始到今天
      const nowDate = getNowDate();
      const monthLBegin = substractDate(dateUnitEnum.monthL, nowDate);
      start_date = start_date ? start_date : monthLBegin;
      end_date = end_date ? end_date : nowDate;
      // 拿到这段时间的所有交易日（不含当天）
      const backTestDateRangeResult = await this.backTestDateRange(
        start_date,
        end_date,
      );
      return backTestDateRangeResult;
    }
  }

  public async start(params?: {
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<BackTestOneDayResult | BackTestDateRangeResult> {
    const result = await this.start_core(params);
    return result;
  }
}
