import { Inject, Injectable } from '@nestjs/common';
import { DailyResult } from '@/tushare/stock/quotes/daily';
import { ClientProxy } from '@nestjs/microservices';
import { DailyBasicResult } from '@/tushare/stock/quotes/daily_basic';
import TushareData from '../../tushare.data';
import SharesSelectUtil from '../shares_select.util';
import LimitThsSelect from '../ths/limit.ths_select';
import { curHotThsDirection } from '../ths/ths.static';
import BaseStockSelect from './base.stock_select';

/* 
  何为强势个股？
    1.涨停的即为强势股
*/

@Injectable()
export default class LimitStockSelect extends BaseStockSelect {
  constructor(
    public readonly tushareData: TushareData,
    public readonly sharesSelectUtil: SharesSelectUtil,
    public readonly limitThsSelect: LimitThsSelect,
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
  ) {
    super(tushareData, sharesSelectUtil, notifyClient);
    this.stockThsMap = {};
    this.thsCodes = [];
  }

  protected getStockFilters(): ((
    codes: string[],
    date: string,
  ) => Promise<string[]>)[] {
    this.stockFilters = [this.stockFilter.bind(this)];
    return this.stockFilters;
  }

  async getStockPool(date: string): Promise<string[]> {
    const dragonThsCodes = await this.limitThsSelect.start_core(date);
    const thsCodes = dragonThsCodes.concat(curHotThsDirection);
    this.thsCodes = thsCodes;
    const thsStockCodes = await this.getThsStockCodes(thsCodes);
    const poolCodes = [];
    const trade_date = (
      await this.sharesSelectUtil.utilGetBeforeTradeDates(date, 1)
    )[0];
    const dailyBasics = await this.tushareData.getDailyBasicByTradeDate(
      trade_date,
    );
    const stockBasics = await this.tushareData.getStockBasic();
    dailyBasics.forEach((dailyBasic: DailyBasicResult) => {
      const { ts_code, total_mv, volume_ratio, turnover_rate } = dailyBasic;
      if (
        // 创业板不能买 => 去除
        stockBasics[ts_code] &&
        (stockBasics[ts_code].market === '主板' ||
          stockBasics[ts_code].market === '中小板')
      ) {
        poolCodes.push(dailyBasic.ts_code);
      }
    });
    const poolSet = new Set(poolCodes);
    const result = thsStockCodes.filter((item) => {
      return poolSet.has(item);
    });
    this.stockPoolCodes = result;
    return result;
  }

  async stockFilter(codes: string[], date: string): Promise<string[]> {
    const filterCodes = [];
    const trade_dates = await this.sharesSelectUtil.utilGetBeforeTradeDates(
      date,
      10,
    );
    const recent1Day = trade_dates[0];
    const recent2Day = trade_dates[1];
    const pArr = [];
    for (let i = 0; i < codes.length; i += 100) {
      const curCodes = codes.slice(i, i + 100);
      pArr.push(
        this.tushareData.getStockDailys(curCodes).catch(() => {
          console.log(
            `计算错误，filter: asyncPriceFilter: ${curCodes.join(',')}`,
          );
        }),
      );
    }
    await Promise.all(pArr).then((datas) => {
      // 行情数组二维变一维
      if (datas.length) {
        datas = datas.reduce(function (a, b) {
          return a.concat(b);
        });
      }
      datas.forEach(
        (data: {
          stockDaily: { [trade_date: string]: DailyResult };
          lastStockDaily: DailyResult;
        }) => {
          if (!data) {
            return;
          }
          const { stockDaily } = data;
          const priceArr = [];
          const pctChgs = [];
          const highArr = [];
          const amountArr = [];
          for (let i = 0; i < trade_dates.length; i++) {
            const curStockDaily = stockDaily[trade_dates[i]];
            if (!curStockDaily) {
              return;
            }
            const { close, pct_chg, amount, ts_code, high } = curStockDaily;
            priceArr.push(close);
            pctChgs.push(pct_chg);
            highArr.push(high);
            amountArr.push(amount);
          }
          if (!stockDaily[recent1Day] || !stockDaily[recent2Day]) {
            return;
          }
          const {
            amount: recent1Amount,
            low: recent1Low,
            high: recent1High,
            open: recent1Open,
            close: recent1Close,
            pct_chg: recent1PctChg,
            ts_code,
          } = stockDaily[recent1Day];
          if (recent1PctChg > 9.8 && true) {
            filterCodes.push(ts_code);
          }
        },
      );
    });
    return filterCodes;
  }
}
