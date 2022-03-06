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
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export default class TushareData {
  constructor(
    @Inject('SERVICE_DATA') public readonly dataClient: ClientProxy,
  ) {}

  public async getTradeCal(): Promise<{ [date: string]: TradeCalResult }> {
    const data = await this.dataClient.send('base/tradeCal', {}).toPromise();
    return data;
  }

  public async getEtfBasic(): Promise<{
    [ts_code: string]: FundBasicResult;
  } | null> {
    const data = await this.dataClient.send('etf/basics', {}).toPromise();
    return data;
  }

  public async getEtfCodes(): Promise<string[] | null> {
    const data = await this.dataClient.send('etf/codes', {}).toPromise();
    return data;
  }

  // 获取股票的基本信息
  public async getStockBasic(): Promise<{
    [ts_code: string]: StockBasicResult;
  } | null> {
    const data = await this.dataClient.send('stock/basics', {}).toPromise();
    return data;
  }

  // 获取所有股票的代码
  public async getStockCodes(): Promise<string[] | null> {
    const data = await this.dataClient.send('stock/codes', {}).toPromise();
    return data;
  }

  public async getEtfDaily(ts_code: string): Promise<{
    etfDaily: { [trade_date: string]: FundDailyResult };
    lastEtfDaily: FundDailyResult;
  } | null> {
    const data = await this.dataClient.send('etf/daily', ts_code).toPromise();
    return data;
  }

  // 根据日期拿每日指标，主要用于过滤得到股票池
  public async getDailyBasicByTradeDate(
    trade_date: string,
  ): Promise<DailyBasicResult[] | null> {
    const data = await this.dataClient
      .send('stock/dailyBasic', { trade_date })
      .toPromise();
    return data;
  }

  public async getDailyBasic(ts_code: string): Promise<{
    dailyBasic: { [trade_date: string]: DailyBasicResult };
    lastDailyBasic: DailyBasicResult;
  } | null> {
    const data = await this.dataClient
      .send('stock/dailyBasic', { ts_code })
      .toPromise();
    return data;
  }

  public async getIndexDaily(ts_code: string): Promise<{
    indexDaily: { [trade_date: string]: IndexDailyResult };
    lastIndexDaily: IndexDailyResult;
  } | null> {
    const data = await this.dataClient.send('index/daily', ts_code).toPromise();
    return data;
  }

  public async getStockDaily(ts_code: string): Promise<{
    stockDaily: { [trade_date: string]: DailyResult };
    lastStockDaily: DailyResult;
  } | null> {
    const data = await this.dataClient.send('stock/daily', ts_code).toPromise();
    return data;
  }

  public async getStockWeekly(ts_code: string): Promise<{
    stockWeekly: { [trade_date: string]: WeeklyResult };
    lastStockWeekly: WeeklyResult;
  } | null> {
    const data = await this.dataClient
      .send('stock/weekly', ts_code)
      .toPromise();
    return data;
  }

  public async getStockMonthly(ts_code: string): Promise<{
    stockMonthly: { [trade_date: string]: MonthlyResult };
    lastStockMonthly: MonthlyResult;
  } | null> {
    const data = await this.dataClient
      .send('stock/monthly', ts_code)
      .toPromise();
    return data;
  }

  // 获取板块的基本信息
  public async getThsBasics(): Promise<{
    [ts_code: string]: ThsIndexResult;
  } | null> {
    const data = await this.dataClient.send('ths/basics', {}).toPromise();
    return data;
  }

  // 获取所有板块的代码
  public async getThsCodes(): Promise<string[] | null> {
    const data = await this.dataClient.send('ths/codes', {}).toPromise();
    return data;
  }

  // 获取板块成分股
  public async getThsMembers(
    ts_code: string,
  ): Promise<ThsMemberResult[] | null> {
    const data = await this.dataClient.send('ths/members', ts_code).toPromise();
    return data;
  }

  // 获取板块行情
  public async getThsDaily(ts_code: string): Promise<{
    thsDaily: { [trade_date: string]: ThsDailyResult };
    lastThsDaily: ThsDailyResult;
  } | null> {
    const data = await this.dataClient.send('ths/daily', ts_code).toPromise();
    return data;
  }

  // 获取板块行情
  public async getThsDailyByTradeDate(
    trade_date: string,
  ): Promise<ThsDailyResult[] | null> {
    const data = await this.dataClient
      .send('ths/dailyByTradeDate', trade_date)
      .toPromise();
    return data;
  }
}
