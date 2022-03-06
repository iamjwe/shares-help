import { FundBasicResult } from '@/tushare/fund/fund_basic';
import { FundDailyResult } from '@/tushare/fund/fund_daily';
import { IndexDailyResult } from '@/tushare/index/index_daily';
import { ThsDailyResult } from '@/tushare/index/ths_daily';
import { ThsIndexResult } from '@/tushare/index/ths_index';
import { ThsMemberResult } from '@/tushare/index/ths_member';
import { StockBasicResult } from '@/tushare/stock/base/stock_basic';
import { TradeCalResult } from '@/tushare/stock/base/trade_cal';
import { DailyResult } from '@/tushare/stock/quotes/daily';
import { DailyBasicResult } from '@/tushare/stock/quotes/daily_basic';
import { MonthlyResult } from '@/tushare/stock/quotes/monthly';
import { WeeklyResult } from '@/tushare/stock/quotes/weekly';
import { Controller, OnApplicationBootstrap } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import BaseData from './tushare/base.data';
import EtfData from './tushare/etf.data';
import IndexData from './tushare/index.data';
import StockData from './tushare/stock.data';
import ThsData from './tushare/ths.data';

@Controller()
export class DataController implements OnApplicationBootstrap {
  constructor(
    private readonly baseData: BaseData,
    private readonly etfData: EtfData,
    private readonly indexData: IndexData,
    private readonly stockData: StockData,
    private readonly thsData: ThsData,
  ) {}

  async onApplicationBootstrap() {
    //
  }

  @MessagePattern('base/tradeCal')
  async getTradeCal(): Promise<{
    [date: string]: TradeCalResult;
  } | null> {
    const data = await this.baseData.getTradeCal();
    return data;
  }

  @MessagePattern('ths/basics')
  async getThsBasic(): Promise<{
    [ts_code: string]: ThsIndexResult;
  } | null> {
    const data = await this.thsData.getThsBasic();
    return data;
  }

  @MessagePattern('index/daily')
  async getIndexDaily(ts_code: string): Promise<{
    indexDaily: { [trade_date: string]: IndexDailyResult };
    lastIndexDaily: IndexDailyResult;
  } | null> {
    const data = await this.indexData.getIndexDaily(ts_code);
    return data;
  }

  @MessagePattern('ths/codes')
  async getThsCodes(): Promise<string[] | null> {
    const data = await this.thsData.getThsCodes();
    return data;
  }

  @MessagePattern('ths/members')
  async getThsMembers(ts_code: string): Promise<ThsMemberResult[] | null> {
    const data = await this.thsData.getThsMember(ts_code);
    return data;
  }

  @MessagePattern('ths/dailyByTradeDate')
  async getThsDailyByTradeDate(
    trade_date: string,
  ): Promise<ThsDailyResult[] | null> {
    const data = await this.thsData.getThsDailyByTradeDate(trade_date);
    return data;
  }

  @MessagePattern('ths/daily')
  async getThsDaily(ts_code: string): Promise<{
    thsDaily: { [trade_date: string]: ThsDailyResult };
    lastThsDaily: ThsDailyResult;
  } | null> {
    const data = await this.thsData.getThsDaily(ts_code);
    return data;
  }

  @MessagePattern('etf/basics')
  async getEtfBasic(): Promise<{
    [ts_code: string]: FundBasicResult;
  } | null> {
    const data = await this.etfData.getEtfBasics();
    return data;
  }

  @MessagePattern('etf/codes')
  async getEtfCodes(): Promise<string[] | null> {
    const data = await this.etfData.getEtfCodes();
    return data;
  }

  @MessagePattern('etf/daily')
  async getEtfDaily(ts_code: string): Promise<{
    etfDaily: { [trade_date: string]: FundDailyResult };
    lastEtfDaily: FundDailyResult;
  } | null> {
    const data = await this.etfData.getEtfDailyByTsCodeAfterAdj(ts_code);
    return data;
  }

  @MessagePattern('stock/basics')
  async getStockBasic(): Promise<{
    [ts_code: string]: StockBasicResult;
  } | null> {
    const data = await this.stockData.getStockBasic();
    return data;
  }

  @MessagePattern('stock/codes')
  async getStockCodes(): Promise<string[] | null> {
    const data = await this.stockData.getStockCodes();
    return data;
  }

  @MessagePattern('stock/dailyBasic')
  async getDailyBasic(params: {
    trade_date?: string;
    ts_code?: string;
  }): Promise<DailyBasicResult[] | null> {
    let data;
    const { trade_date, ts_code } = params;
    if (ts_code) {
      data = await this.stockData.getDailyBasicByTsCode(ts_code);
    }
    if (trade_date) {
      data = await this.stockData.getDailyBasicByTradeDate(trade_date);
    }
    return data;
  }

  @MessagePattern('stock/daily')
  async getDaily(ts_code: string): Promise<{
    stockDaily: { [trade_date: string]: DailyResult };
    lastStockDaily: DailyResult;
  } | null> {
    const data = await this.stockData.getStockDailyByTsCodeAfterAdj(ts_code);
    return data;
  }

  @MessagePattern('stock/dailys')
  async getDailys(ts_codes: string[]): Promise<
    | {
        stockDaily: { [trade_date: string]: DailyResult };
        lastStockDaily: DailyResult;
      }[]
    | null
  > {
    const beginTime = Number(new Date());
    let result = null;
    const pArr = [];
    for (let i = 0; i < ts_codes.length; i++) {
      pArr.push(this.stockData.getStockDailyByTsCodeAfterAdj(ts_codes[i]));
    }
    await Promise.all(pArr).then((datas) => {
      if (datas.length > 0) {
        result = datas;
      }
    });
    // if (ts_codes.includes('605123.SH')) {
    //   console.log('getDailys', Number(new Date()) - beginTime);
    // }
    return result;
  }

  @MessagePattern('stock/weekly')
  async getWeekly(ts_code: string): Promise<{
    stockWeekly: { [trade_date: string]: WeeklyResult };
    lastStockWeekly: WeeklyResult;
  } | null> {
    const data = await this.stockData.getStockWeeklyByTsCodeAfterAdj(ts_code);
    return data;
  }

  @MessagePattern('stock/monthly')
  async getMonthly(ts_code: string): Promise<{
    stockMonthly: { [trade_date: string]: MonthlyResult };
    lastStockMonthly: MonthlyResult;
  } | null> {
    const data = await this.stockData.getStockMonthlyByTsCodeAfterAdj(ts_code);
    return data;
  }
}
