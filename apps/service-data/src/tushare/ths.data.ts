import { getThsDaily, ThsDailyResult } from '@/tushare/index/ths_daily';
import ThsDaily from '@/tushare/index/ths_daily.entity';
import { getThsIndex, ThsIndexResult } from '@/tushare/index/ths_index';
import ThsIndex from '@/tushare/index/ths_index.entity';
import { getThsMember, ThsMemberResult } from '@/tushare/index/ths_member';
import ThsMember from '@/tushare/index/ths_member.entity';
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
import { CACHE_KEY_THS_DATA_SYNC } from './ths.sync';

export const CACHE_KEY = {
  THS_MEMBERS: 'ths_members',
  THS_DAILYS: 'ths_dailys',
  THS_DAILY_LASTS: 'ths_daily_lasts',
  THS_DAILYS_BY_TRADE_DATE: 'ths_dailys_by_trade_date',
  THS_BASICS: 'ths_basic',
  THS_CODES: 'ths_codes',
};

// private fetch系列抓取数据，get系列提供给外部调用（会利用缓存）
@Injectable()
export default class ThsData implements OnApplicationBootstrap {
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(ThsIndex)
    private thsIndexRepository: Repository<ThsIndex>,
    @InjectRepository(ThsMember)
    private thsMemberRepository: Repository<ThsMember>,
    @InjectRepository(ThsDaily)
    private thsDailyRepository: Repository<ThsDaily>,
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

  private async fetchThsIndex(): Promise<{
    thsIndexs: { [ts_code: string]: ThsIndexResult };
    thsCodes: string[];
  } | null> {
    let thsIndexs;
    const haveStoreForThsIndex = await this.cacheManager.get(
      CACHE_KEY_THS_DATA_SYNC.THS_INDEX_READY,
    );
    if (haveStoreForThsIndex) {
      const storeThsIndex = (await this.thsIndexRepository.find({
        where: { exchange: 'A' },
      })) as ThsIndexResult[];
      thsIndexs = storeThsIndex;
    } else {
      thsIndexs = await getThsIndex(this.token, {
        exchange: 'A',
      });
    }
    if (!thsIndexs) {
      return null;
    }
    const thsIndexsMap = {};
    thsIndexs.forEach((row: ThsIndexResult) => {
      thsIndexsMap[row.ts_code] = row;
    });
    const thsCodes = thsIndexs.map((thsIndex: ThsIndexResult) => {
      return thsIndex.ts_code;
    });
    return {
      thsIndexs: thsIndexsMap,
      thsCodes: thsCodes,
    };
  }

  // 获取所有板块
  public async getThsBasic(): Promise<{
    [ts_code: string]: ThsIndexResult;
  } | null> {
    // 先从缓存中拿
    const cacheThsBasics = await this.cacheManager.get(CACHE_KEY.THS_BASICS);
    if (cacheThsBasics) return cacheThsBasics;
    const { thsIndexs } = (await this.fetchThsIndex()) || {};
    if (!thsIndexs) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.THS_BASICS, thsIndexs, {
      ttl: 24 * 60 * 60,
    });
    return thsIndexs;
  }

  // 获取所有板块的代码
  public async getThsCodes(): Promise<string[] | null> {
    const cacheThsCodes = await this.cacheManager.get(CACHE_KEY.THS_CODES);
    if (cacheThsCodes) return cacheThsCodes;
    const { thsCodes } = (await this.fetchThsIndex()) || {};
    if (!thsCodes) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.THS_CODES, thsCodes, {
      ttl: 24 * 60 * 60,
    });
    return thsCodes;
  }

  private async fetchThsMember(
    ts_code: string,
  ): Promise<ThsMemberResult[] | null> {
    let thsMembers;
    const haveStoreForThsMember = await this.cacheManager.get(
      CACHE_KEY_THS_DATA_SYNC.THS_MEMBER_READY,
    );
    if (haveStoreForThsMember) {
      const storeThsMembers = (await this.thsMemberRepository.find({
        where: { ts_code },
      })) as ThsMemberResult[];
      thsMembers = storeThsMembers;
    } else {
      thsMembers = await getThsMember(this.token, {
        ts_code,
      });
    }
    return thsMembers;
  }

  public async getThsMember(
    ts_code: string,
  ): Promise<ThsMemberResult[] | null> {
    // 先从缓存中拿
    const cacheThsMembers =
      (await this.cacheManager.get(CACHE_KEY.THS_MEMBERS)) || {};
    if (cacheThsMembers[ts_code]) return cacheThsMembers[ts_code];
    const thsMembers = (await this.fetchThsMember(ts_code)) || [];
    if (!thsMembers) {
      return null;
    }
    // 缓存
    cacheThsMembers[ts_code] = thsMembers;
    await this.cacheManager.set(CACHE_KEY.THS_MEMBERS, cacheThsMembers, {
      ttl: 24 * 60 * 60,
    });
    return thsMembers;
  }

  private async fetchThsDailyByTradeDate(
    trade_date: string,
  ): Promise<ThsDailyResult[] | null> {
    let thsDailys;
    const haveStoreForThsDaily = await this.cacheManager.get(
      CACHE_KEY_THS_DATA_SYNC.THS_DAILY_READY,
    );
    if (haveStoreForThsDaily) {
      const storeThsDailys = (await this.thsDailyRepository.find({
        where: { trade_date },
        order: { trade_date: 'DESC' },
      })) as ThsDailyResult[];
      thsDailys = storeThsDailys;
    } else {
      thsDailys = await getThsDaily(this.token, {
        trade_date: trade_date,
      });
    }
    if (!thsDailys) {
      return null;
    }
    return thsDailys;
  }

  public async getThsDailyByTradeDate(
    trade_date: string,
  ): Promise<ThsDailyResult[] | null> {
    const cacheThsDailys =
      (await this.cacheManager.get(CACHE_KEY.THS_DAILYS_BY_TRADE_DATE)) || {};
    if (cacheThsDailys[trade_date]) {
      return cacheThsDailys[trade_date];
    }
    const thsDailys = await this.fetchThsDailyByTradeDate(trade_date);
    if (!thsDailys) {
      return null;
    }
    cacheThsDailys[trade_date] = thsDailys;
    await this.cacheManager.set(
      CACHE_KEY.THS_DAILYS_BY_TRADE_DATE,
      cacheThsDailys,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return thsDailys;
  }

  private async fetchThsDaily(ts_code: string): Promise<{
    thsDaily: { [trade_date: string]: ThsDailyResult };
    lastThsDaily: ThsDailyResult;
  } | null> {
    let thsDailys;
    const haveStoreForThsDaily = await this.cacheManager.get(
      CACHE_KEY_THS_DATA_SYNC.THS_DAILY_READY,
    );
    if (haveStoreForThsDaily) {
      const storeThsDailys = (await this.thsDailyRepository.find({
        where: { ts_code, trade_date: MoreThanOrEqual(this.tradeCalBegin) },
        order: { trade_date: 'DESC' },
      })) as ThsDailyResult[];
      thsDailys = storeThsDailys;
    } else {
      thsDailys = await getThsDaily(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    if (!(thsDailys && thsDailys[0])) {
      return null;
    }
    const lastThsDaily = thsDailys[0];
    const thsDailyMap = {};
    thsDailys.forEach((indexDaily) => {
      thsDailyMap[indexDaily.trade_date] = indexDaily;
    });
    return {
      thsDaily: thsDailyMap,
      lastThsDaily: lastThsDaily,
    };
  }

  public async getThsDaily(ts_code: string): Promise<{
    thsDaily: { [trade_date: string]: ThsDailyResult };
    lastThsDaily: ThsDailyResult;
  } | null> {
    // 先从缓存中拿
    const cacheThsDaily =
      (await this.cacheManager.get(CACHE_KEY.THS_DAILYS)) || {};
    const cacheThsDailyLast =
      (await this.cacheManager.get(CACHE_KEY.THS_DAILY_LASTS)) || {};
    if (cacheThsDaily[ts_code] && cacheThsDailyLast[ts_code])
      return {
        thsDaily: cacheThsDaily[ts_code],
        lastThsDaily: cacheThsDailyLast[ts_code],
      };
    const { thsDaily, lastThsDaily } =
      (await this.fetchThsDaily(ts_code)) || {};
    if (!(thsDaily && lastThsDaily)) {
      return null;
    }
    // 缓存
    cacheThsDaily[ts_code] = thsDaily;
    await this.cacheManager.set(CACHE_KEY.THS_DAILYS, cacheThsDaily, {
      ttl: 24 * 60 * 60,
    });
    cacheThsDailyLast[ts_code] = lastThsDaily;
    await this.cacheManager.set(CACHE_KEY.THS_DAILY_LASTS, cacheThsDailyLast, {
      ttl: 24 * 60 * 60,
    });
    return {
      thsDaily,
      lastThsDaily,
    };
  }
}
