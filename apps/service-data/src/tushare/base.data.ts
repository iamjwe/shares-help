import { getTradeCal, TradeCalResult } from '@/tushare/stock/base/trade_cal';
import TradeCal from '@/tushare/stock/base/trade_cal.entity';
import { geeMonthStart, subDay } from '@/utils/date';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { BaseDataSync, CACHE_KEY_BASE_DATA_SYNC } from './base.sync';

export const CACHE_KEY = {
  TRADE_DATES: 'trade_dates',
};

// private fetch系列抓取数据，get系列提供给外部调用（会利用缓存）
@Injectable()
export default class BaseData implements OnApplicationBootstrap {
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(TradeCal)
    private tradeCalRepository: Repository<TradeCal>,
    @Inject(ConfigService) public readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {
    const { token, tradeCalBegin } = this.configService.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
  }

  async onApplicationBootstrap() {
    const tradeCal = await this.getTradeCal(); // 默认缓存交易日历
  }

  private async fetchTradeCal(): Promise<{
    [date: string]: TradeCalResult;
  } | null> {
    let tradeCal; // 数据库里有数据就从数据库中拿，数据库中没有就从tushare里拿并存至数据库中（当前没有更新逻辑，数据不同步时同步数据需要情况数据库）
    const tradeCalBegin = this.tradeCalBegin;
    const haveStoreForTradeCal = await this.cacheManager.get(
      CACHE_KEY_BASE_DATA_SYNC.TRADECAL_READY,
    );
    if (haveStoreForTradeCal) {
      const storeTradeCal = (await this.tradeCalRepository.find({
        where: { cal_date: MoreThanOrEqual(tradeCalBegin) },
      })) as TradeCalResult[];
      tradeCal = storeTradeCal;
    } else {
      tradeCal = await getTradeCal(
        this.token,
        {
          start_date: geeMonthStart(subDay(geeMonthStart(tradeCalBegin))), // 多拿一个月
        },
        ['exchange', 'cal_date', 'is_open', 'pretrade_date'],
      );
    }
    const tradeCalMap = {};
    if (!tradeCal) {
      return null;
    }
    tradeCal.forEach((row: TradeCalResult) => {
      tradeCalMap[row.cal_date] = row;
    });
    return tradeCalMap;
  }

  public async getTradeCal(): Promise<{
    [date: string]: TradeCalResult;
  } | null> {
    const cacheTradeCal = await this.cacheManager.get(CACHE_KEY.TRADE_DATES);
    if (cacheTradeCal) {
      return cacheTradeCal;
    }
    const tradeCal = await this.fetchTradeCal();
    if (!tradeCal) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.TRADE_DATES, tradeCal, {
      ttl: 24 * 60 * 60,
    });
    return tradeCal;
  }
}
