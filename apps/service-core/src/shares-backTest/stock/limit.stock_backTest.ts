import Daily from '@/tushare/stock/quotes/daily.entity';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import LimitStockOperate from '../../shares-operate/stock/limit.stock_operate';
import LimitStockSelect from '../../shares-select/stock/limit.stock_select';
import TushareData from '../../tushare.data';
import SharesBackTestUtil from '../shares_backTest.util';
import BaseStockBackTest from './base.stock_backTest';
import {
  BackTestOneDayResult,
  BackTestDateRangeResult,
} from './type.stock_backTest';

/*
 */

@Injectable()
export default class LimitStockBackTest extends BaseStockBackTest {
  constructor(
    public readonly tushareData: TushareData,
    public readonly sharesBackTestUtil: SharesBackTestUtil,
    public readonly limitStockSelect: LimitStockSelect,
    public readonly limitStockOperate: LimitStockOperate,
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
  ) {
    super(tushareData, notifyClient);
    this.stockSelect = limitStockSelect;
    this.stockOperate = limitStockOperate;
  }

  protected async getTradeDateByDateRange(
    start_date: string,
    end_date: string,
  ): Promise<string[]> {
    const trade_dates =
      await this.sharesBackTestUtil.utilGetTradeDatesByRangeDateLcRo(
        start_date,
        end_date,
      );
    return trade_dates;
  }
}
