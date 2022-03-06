import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { TradeCalResult } from '@/tushare/stock/base/trade_cal';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import TushareData from '../tushare.data';
import {
  addDay,
  getRangeDateLoRc,
  getRangeDateSliceByWeekLoRc,
} from '../../../utils/date';

@Injectable()
export default class SharesSelectUtil {
  constructor(
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
    @Inject(ConfigService) public readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    public readonly tushareData: TushareData,
  ) {}

  // 通用工具方法：获取某一个日期之前的所有交易日（不包含自身，recent传0返回自身）
  async utilGetBeforeTradeDates(
    date: string,
    recent?: number,
  ): Promise<string[]> {
    const tradeCalArr = await this.tushareData.getTradeCal();
    const tradeDates: string[] = [];
    if (!recent) {
      while (tradeCalArr[date]) {
        const tradeDate = tradeCalArr[date].pretrade_date;
        tradeDates.push(tradeDate);
        date = tradeDate;
      }
      return tradeDates;
    }
    if (recent === 0) {
      return [date];
    }
    while (recent--) {
      const tradeCal = tradeCalArr[date] as TradeCalResult;
      const tradeDate = tradeCal.pretrade_date;
      tradeDates.push(tradeDate);
      date = tradeDate;
    }
    return tradeDates;
  }

  // 通用工具方法：获取临近某一个日期之后的n个交易日。如果当日就是那么就返回当日
  async utilGetAfterTradeDates(
    date: string,
    recent: number,
  ): Promise<string[]> {
    if (recent === 0) {
      return [date];
    }
    const tradeDates: string[] = [];
    const tradeCalArr = await this.tushareData.getTradeCal();
    while (recent--) {
      let curTradeCal = tradeCalArr[date] as TradeCalResult;
      while (!curTradeCal.is_open) {
        curTradeCal = tradeCalArr[addDay(curTradeCal.cal_date)];
      }
      const tradeDate = curTradeCal.cal_date;
      tradeDates.push(tradeDate);
      date = addDay(tradeDate);
    }
    return tradeDates;
  }

  utilSyncGetAfterTradeDates(
    date: string,
    recent: number,
    tradeCalArr: {
      [date: string]: TradeCalResult;
    },
  ): string[] {
    if (recent === 0) {
      return [date];
    }
    const tradeDates: string[] = [];
    while (recent--) {
      let curTradeCal = tradeCalArr[date] as TradeCalResult;
      while (!curTradeCal.is_open) {
        curTradeCal = tradeCalArr[addDay(curTradeCal.cal_date)];
      }
      const tradeDate = curTradeCal.cal_date;
      tradeDates.push(tradeDate);
      date = addDay(tradeDate);
    }
    return tradeDates;
  }

  // 通用工具方法：获取一个时间范围内的所有交易日（左闭右开）
  async utilGetTradeDatesByRangeDateLcRo(
    startDate: string,
    endDate: string,
  ): Promise<string[]> {
    const tradeDates = [];
    const tradeCalArr = await this.tushareData.getTradeCal();
    const dates = getRangeDateLoRc(startDate, endDate);
    dates.forEach((date) => {
      const tradeCal = tradeCalArr[date] as TradeCalResult;
      if (tradeCal.is_open === 1) {
        tradeDates.push(tradeCal.cal_date);
      }
    });
    return tradeDates;
  }
  // 同步获取一个时间段内所有交易周的最后交易日
  utilSyncGetWeekTradeDatesByRangeDateLcRo(
    startDate: string,
    endDate: string,
    tradeCalArr: {
      [date: string]: TradeCalResult;
    },
  ): string[] {
    const tradeDates = []; // 有序，从小到大
    const datess = getRangeDateSliceByWeekLoRc(startDate, endDate);
    datess.forEach((dates) => {
      // 对每周的日期进行倒序遍历取第一个交易日
      for (let i = dates.length - 1; i >= 0; i--) {
        const date = dates[i];
        const tradeCal = tradeCalArr[date] as TradeCalResult;
        if (tradeCal.is_open === 1) {
          tradeDates.push(tradeCal.cal_date);
          break;
        }
      }
    });
    return tradeDates;
  }

  // 获取一个时间段内所有交易周的最后交易日
  async utilGetWeekTradeDatesByRangeDateLcRo(
    startDate: string,
    endDate: string,
  ): Promise<string[]> {
    const tradeDates = []; // 有序，从小到大
    const tradeCalArr = await this.tushareData.getTradeCal();
    const datess = getRangeDateSliceByWeekLoRc(startDate, endDate);
    datess.forEach((dates) => {
      // 对每周的日期进行倒序遍历取第一个交易日
      for (let i = dates.length - 1; i >= 0; i--) {
        const date = dates[i];
        const tradeCal = tradeCalArr[date] as TradeCalResult;
        if (tradeCal.is_open === 1) {
          tradeDates.push(tradeCal.cal_date);
          break;
        }
      }
    });
    return tradeDates;
  }
}
