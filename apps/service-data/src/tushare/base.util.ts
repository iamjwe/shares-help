import { getTradeCal, TradeCalResult } from '@/tushare/stock/base/trade_cal';
import TradeCal from '@/tushare/stock/base/trade_cal.entity';
import { addDay, getRangeDateLoRc } from '@/utils/date';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import BaseData from './base.data';

export const CACHE_KEY = {
  TRADE_DATES: 'trade_dates',
};

// private fetch系列抓取数据，get系列提供给外部调用（会利用缓存）
@Injectable()
export default class BaseDataUtil {
  token: string;
  tradeCalBegin: string;
  constructor(
    @Inject(ConfigService) public readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    private readonly baseData: BaseData,
  ) {}

  async utilGetTradeDatesByRangeDate(
    startDate: string,
    endDate: string,
  ): Promise<string[]> {
    const tradeDates = [];
    const tradeCalArr = await this.baseData.getTradeCal();
    const dates = getRangeDateLoRc(startDate, addDay(endDate));
    dates.forEach((date) => {
      const tradeCal = tradeCalArr[date] as TradeCalResult;
      if (tradeCal.is_open === 1) {
        tradeDates.push(tradeCal.cal_date);
      }
    });
    return tradeDates;
  }

  async utilGetBeforeTradeDates(
    date: string,
    recent?: number,
  ): Promise<string[]> {
    const tradeCalMap = await this.baseData.getTradeCal();
    const tradeDates: string[] = [];
    if (recent === 0) {
      return [date];
    }
    while (recent--) {
      const tradeCal = tradeCalMap[date] as TradeCalResult;
      const tradeDate = tradeCal.pretrade_date;
      tradeDates.push(tradeDate);
      date = tradeDate;
    }
    return tradeDates;
  }

  async utilGetAfterTradeDates(
    date: string,
    recent: number,
  ): Promise<string[]> {
    if (recent === 0) {
      return [date];
    }
    const tradeDates: string[] = [];
    const tradeCalMap = await this.baseData.getTradeCal();
    while (recent--) {
      let curTradeCal = tradeCalMap[date] as TradeCalResult;
      while (!curTradeCal.is_open) {
        curTradeCal = tradeCalMap[addDay(curTradeCal.cal_date)];
        date = addDay(curTradeCal.cal_date);
      }
      const tradeDate = curTradeCal.cal_date;
      tradeDates.push(tradeDate);
      date = addDay(tradeDate);
    }
    return tradeDates;
  }
}
