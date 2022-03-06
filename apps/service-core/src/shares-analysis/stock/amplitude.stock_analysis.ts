import { DailyResult } from '@/tushare/stock/quotes/daily';
import { DailyBasicResult } from '@/tushare/stock/quotes/daily_basic';
import { calAvag } from '@/utils/number';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import TushareData from '../../tushare.data';
import SharesAnalysisUtil from '../shares_analysis.util';

/*
 */

@Injectable()
export default class AmplitudeStockAnalysis {
  constructor(
    public readonly tushareData: TushareData,
    public readonly sharesAnalysisUtil: SharesAnalysisUtil,
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
  ) {}

  async start(date: string, amplitude: number): Promise<number> {
    let poolCodes = await this.getStockPool(date);
    poolCodes = await this.poolFilter(poolCodes, date, amplitude);
    const stockCodes = await this.stockFilter(poolCodes, date, amplitude);
    console.log(poolCodes.length, stockCodes.length, stockCodes.slice(0, 10));
    const percent = (stockCodes.length / poolCodes.length).toFixed(2);
    const before_date = (
      await this.sharesAnalysisUtil.utilGetBeforeTradeDates(date, 1)
    )[0];
    console.log(
      `交易日：${before_date}，股票池数量：${poolCodes.length}, 振幅超过${amplitude}的数量： ${stockCodes.length}，振幅超过${amplitude}的比率： ${percent}`,
    );
    return Number(percent);
  }

  async getStockPool(date: string): Promise<string[]> {
    const poolCodes = [];
    const trade_date = (
      await this.sharesAnalysisUtil.utilGetBeforeTradeDates(date, 1)
    )[0];
    const dailyBasics = await this.tushareData.getDailyBasicByTradeDate(
      trade_date,
    );
    const stockBasics = await this.tushareData.getStockBasic();
    dailyBasics.forEach((dailyBasic: DailyBasicResult) => {
      const { ts_code, total_mv, volume_ratio, turnover_rate } = dailyBasic;
      if (
        // 创业板不能买 => 去除
        total_mv < 5000000 &&
        stockBasics[ts_code] &&
        (stockBasics[ts_code].market === '主板' ||
          stockBasics[ts_code].market === '中小板')
      ) {
        poolCodes.push(dailyBasic.ts_code);
      }
    });
    return poolCodes;
  }

  async poolFilter(
    codes: string[],
    date: string,
    amplitude: number,
  ): Promise<string[]> {
    const filterCodes = [];
    const trade_dates = await this.sharesAnalysisUtil.utilGetBeforeTradeDates(
      date,
      60,
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
            pre_close: recent1PreClose,
            ts_code,
          } = stockDaily[recent1Day];
          const {
            amount: recent2Amount,
            low: recent2Low,
            high: recent2High,
            open: recent2Open,
            close: recent2Close,
            pct_chg: recent2PctChg,
          } = stockDaily[recent2Day];
          const ma5Price = calAvag(priceArr.slice(0, 5));
          const ma5Amount = calAvag(amountArr.slice(0, 5));
          const ma10Price = calAvag(priceArr.slice(0, 10));
          const ma10Amount = calAvag(amountArr.slice(0, 10));
          const ma20Price = calAvag(priceArr.slice(0, 20));
          const ma30Price = calAvag(priceArr.slice(0, 30));
          if (recent2Close > recent2Open && ma5Price > ma10Price && true) {
            filterCodes.push(ts_code);
          }
        },
      );
    });
    return filterCodes;
  }

  async stockFilter(
    codes: string[],
    date: string,
    amplitude: number,
  ): Promise<string[]> {
    const filterCodes = [];
    const trade_dates = await this.sharesAnalysisUtil.utilGetBeforeTradeDates(
      date,
      60,
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
            pre_close: recent1PreClose,
            ts_code,
          } = stockDaily[recent1Day];
          const {
            amount: recent2Amount,
            low: recent2Low,
            high: recent2High,
            open: recent2Open,
            close: recent2Close,
            pct_chg: recent2PctChg,
          } = stockDaily[recent2Day];
          const ma5Price = calAvag(priceArr.slice(0, 5));
          const ma5Amount = calAvag(amountArr.slice(0, 5));
          const ma10Price = calAvag(priceArr.slice(0, 10));
          const ma10Amount = calAvag(amountArr.slice(0, 10));
          const ma20Price = calAvag(priceArr.slice(0, 20));
          const ma30Price = calAvag(priceArr.slice(0, 30));
          if (recent1PreClose * (1 + amplitude / 100) < recent1High && true) {
            filterCodes.push(ts_code);
          }
        },
      );
    });
    return filterCodes;
  }
}
