import { getIndexDaily, IndexDailyResult } from '@/tushare/index/index_daily';
import IndexDaily from '@/tushare/index/index_daily.entity';
import { getNowDate } from '@/utils/date';
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
import { CACHE_KEY_INDEX_DATA_SYNC } from './index.sync';

export const CACHE_KEY = {
  INDEX_DAILYS: 'index_dailys',
  INDEX_DAILY_LASTS: 'index_daily_lasts',
};

// private fetch系列抓取数据，get系列提供给外部调用（会利用缓存）
@Injectable()
export default class IndexData implements OnApplicationBootstrap {
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(IndexDaily)
    private indexDailyRepository: Repository<IndexDaily>,
    @Inject(ConfigService) public readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {
    const { token, tradeCalBegin } = this.configService.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
  }
  onApplicationBootstrap() {
    //
  }

  private async fetchIndexDaily(ts_code: string): Promise<{
    indexDaily: { [trade_date: string]: IndexDailyResult };
    lastIndexDaily: IndexDailyResult;
  } | null> {
    let indexDailys;
    const haveStoreForIndexDaily = await this.cacheManager.get(
      CACHE_KEY_INDEX_DATA_SYNC.INDEX_DAILY_READY,
    );
    if (haveStoreForIndexDaily) {
      const storeIndexDailys = (await this.indexDailyRepository.find({
        where: { ts_code, trade_date: MoreThanOrEqual(this.tradeCalBegin) },
        order: { trade_date: 'DESC' },
      })) as IndexDailyResult[];
      indexDailys = storeIndexDailys;
    } else {
      indexDailys = await getIndexDaily(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    const lastIndexDaily = indexDailys[0];
    const indexDailyMap = {};
    indexDailys.forEach((indexDaily) => {
      indexDailyMap[indexDaily.trade_date] = indexDaily;
    });
    return {
      indexDaily: indexDailyMap,
      lastIndexDaily: lastIndexDaily,
    };
  }
  // 拉取指数日线行情
  public async getIndexDaily(ts_code: string): Promise<{
    indexDaily: { [trade_date: string]: IndexDailyResult };
    lastIndexDaily: IndexDailyResult;
  } | null> {
    // 先从缓存中拿
    const cacheIndexDaily =
      (await this.cacheManager.get(CACHE_KEY.INDEX_DAILYS)) || {};
    const cacheIndexDailyLast =
      (await this.cacheManager.get(CACHE_KEY.INDEX_DAILY_LASTS)) || {};
    if (cacheIndexDaily[ts_code] && cacheIndexDailyLast[ts_code])
      return {
        indexDaily: cacheIndexDaily[ts_code],
        lastIndexDaily: cacheIndexDailyLast[ts_code],
      };
    const { indexDaily, lastIndexDaily } =
      (await this.fetchIndexDaily(ts_code)) || {};
    if (!indexDaily) {
      return null;
    }
    // 缓存
    cacheIndexDaily[ts_code] = indexDaily;
    await this.cacheManager.set(CACHE_KEY.INDEX_DAILYS, cacheIndexDaily, {
      ttl: 24 * 60 * 60,
    });
    cacheIndexDailyLast[ts_code] = lastIndexDaily;
    await this.cacheManager.set(
      CACHE_KEY.INDEX_DAILY_LASTS,
      cacheIndexDailyLast,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return {
      indexDaily,
      lastIndexDaily,
    };
  }
}
