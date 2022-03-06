import { FundAdjResult, getFundAdj } from '@/tushare/fund/fund_adj';
import FundAdj from '@/tushare/fund/fund_adj.entity';
import { FundBasicResult, getFundBasic } from '@/tushare/fund/fund_basic';
import FundBasic from '@/tushare/fund/fund_basic.entity';
import { FundDailyResult, getFundDaily } from '@/tushare/fund/fund_daily';
import FundDaily from '@/tushare/fund/fund_daily.entity';
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
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { CACHE_KEY_ETF_DATA_SYNC } from './etf.sync';

export const CACHE_KEY = {
  ETF_BASICS: 'etf_basics',
  ETF_CODES: 'etf_codes',
  ETF_ADJS: 'etf_adjs',
  ETF_ADJ_LASTS: 'etf_adj_lasts',
  ETF_DAILYS: 'etf_dailys',
  ETF_DAILY_LASTS: 'etf_daily_lasts',
};

// private fetch系列抓取数据，get系列提供给外部调用（会利用缓存）
@Injectable()
export default class EtfData implements OnApplicationBootstrap {
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(FundBasic)
    private fundBasicRepository: Repository<FundBasic>,
    @InjectRepository(FundAdj)
    private fundAdjRepository: Repository<FundAdj>,
    @InjectRepository(FundDaily)
    private fundDailyRepository: Repository<FundDaily>,
    @Inject(ConfigService) public readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {
    const { token, tradeCalBegin } = this.configService.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
  }
  async onApplicationBootstrap() {
    //
  }

  private async fetchEtfBasic(): Promise<{
    etfBasics: { [ts_code: string]: FundBasicResult };
    etfCodes: string[];
  } | null> {
    let etfBasics;
    const haveStoreForEtfBasic = await this.cacheManager.get(
      CACHE_KEY_ETF_DATA_SYNC.ETF_BASIC_READY,
    );
    if (haveStoreForEtfBasic) {
      const storeEtfBasics = (await this.fundBasicRepository.find({
        where: { market: 'E', status: 'L' },
      })) as FundBasicResult[];
      etfBasics = storeEtfBasics;
    } else {
      etfBasics = await getFundBasic(this.token, {
        market: 'E',
        status: 'L',
      });
    }
    if (!etfBasics) {
      return null;
    }
    const etfBasicsMap = {};
    const etfCodes = [];
    etfBasics.forEach((row: FundBasicResult) => {
      if (row.name.match(/ETF/)) {
        const { ts_code } = row;
        etfBasicsMap[ts_code] = row;
        etfCodes.push(ts_code);
      }
    });
    return {
      etfBasics: etfBasicsMap,
      etfCodes,
    };
  }

  public async getEtfBasics(): Promise<{
    [ts_code: string]: FundBasicResult;
  } | null> {
    const cacheEtfBasics = await this.cacheManager.get(CACHE_KEY.ETF_BASICS);
    if (cacheEtfBasics) return cacheEtfBasics;
    const { etfBasics } = (await this.fetchEtfBasic()) || {};
    if (!etfBasics) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.ETF_BASICS, etfBasics, {
      ttl: 24 * 60 * 60,
    });
    return etfBasics;
  }

  public async getEtfCodes(): Promise<string[] | null> {
    const cacheEtfCodes = await this.cacheManager.get(CACHE_KEY.ETF_CODES);
    if (cacheEtfCodes) return cacheEtfCodes;
    const { etfCodes } = (await this.fetchEtfBasic()) || {};
    if (!etfCodes) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.ETF_CODES, etfCodes, {
      ttl: 24 * 60 * 60,
    });
    return etfCodes;
  }

  private async fetchEtfAdjByTsCode(ts_code: string): Promise<{
    etfAdj: { [trade_date: string]: FundAdjResult };
    lastEtfAdj: FundAdjResult;
  } | null> {
    let adjs;
    const haveStoreForEtfAdjs = await this.cacheManager.get(
      CACHE_KEY_ETF_DATA_SYNC.ETF_ADJ_READY,
    );
    if (haveStoreForEtfAdjs) {
      const storeAdjs = (await this.fundAdjRepository.find({
        where: {
          ts_code,
          trade_date: MoreThanOrEqual(this.tradeCalBegin),
        },
        order: { trade_date: 'DESC' },
      })) as FundAdjResult[];
      adjs = storeAdjs;
    } else {
      adjs = await getFundAdj(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    // 最新复权因子
    if (!adjs) {
      return null;
    }
    const lastEtfAdj = adjs[0];
    const etfAdjMap = {};
    adjs.forEach((adj) => {
      etfAdjMap[adj.trade_date] = adj;
    });
    return {
      etfAdj: etfAdjMap,
      lastEtfAdj,
    };
  }

  public async getEtfAdjByTsCode(ts_code: string): Promise<{
    etfAdj: { [trade_date: string]: FundAdjResult };
    lastEtfAdj: FundAdjResult;
  } | null> {
    // 先从缓存中拿
    const cacheEtfAdjs =
      (await this.cacheManager.get(CACHE_KEY.ETF_ADJS)) || {};
    const cacheEtfAdjLast =
      (await this.cacheManager.get(CACHE_KEY.ETF_ADJ_LASTS)) || {};
    if (cacheEtfAdjs[ts_code] && cacheEtfAdjLast[ts_code]) {
      return {
        etfAdj: cacheEtfAdjs[ts_code],
        lastEtfAdj: cacheEtfAdjLast[ts_code],
      };
    }
    // 缓存中没有
    const { etfAdj: etfAdj, lastEtfAdj: lastEtfAdj } =
      (await this.fetchEtfAdjByTsCode(ts_code)) || {};
    if (!etfAdj) {
      return null;
    }
    // 把该ts_code的adj数据加入缓存当中
    cacheEtfAdjs[ts_code] = etfAdj;
    await this.cacheManager.set(CACHE_KEY.ETF_ADJS, cacheEtfAdjs, {
      ttl: 24 * 60 * 60,
    });
    // 把该ts_code的最新adj数据加入缓存当中
    cacheEtfAdjLast[ts_code] = lastEtfAdj;
    await this.cacheManager.set(CACHE_KEY.ETF_ADJ_LASTS, cacheEtfAdjLast, {
      ttl: 24 * 60 * 60,
    });
    return {
      etfAdj: etfAdj,
      lastEtfAdj,
    };
  }

  // 对单个交易记录进行复权
  private adjEtfRow(
    adjRow: FundDailyResult,
    curAdj: FundAdjResult,
    lastAdj: FundAdjResult,
  ): FundDailyResult {
    // 往前的时间会没有复权因子，没有复权因子则不做复权
    if (!(curAdj && lastAdj)) {
      return;
    }
    adjRow.close = (adjRow.close * curAdj.adj_factor) / lastAdj.adj_factor;
    adjRow.open = (adjRow.open * curAdj.adj_factor) / lastAdj.adj_factor;
    adjRow.high = (adjRow.high * curAdj.adj_factor) / lastAdj.adj_factor;
    adjRow.low = (adjRow.low * curAdj.adj_factor) / lastAdj.adj_factor;
    return adjRow;
  }

  // 拉取复权日线数据
  private async fetchEtfDailyByTsCodeAfterAdj(ts_code: string): Promise<{
    etfDaily: { [trade_date: string]: FundDailyResult };
    lastEtfDaily: FundDailyResult;
  } | null> {
    let etfDailys;
    const haveStoreForEtfDaily = await this.cacheManager.get(
      CACHE_KEY_ETF_DATA_SYNC.ETF_DAILY_READY,
    );
    if (haveStoreForEtfDaily) {
      const storeEtfDailys = (await this.fundDailyRepository.find({
        where: {
          ts_code,
          trade_date: MoreThanOrEqual(this.tradeCalBegin),
        },
        order: { trade_date: 'DESC' },
      })) as FundDailyResult[];
      etfDailys = storeEtfDailys;
    } else {
      etfDailys = await getFundDaily(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    const { etfAdj, lastEtfAdj } =
      (await this.getEtfAdjByTsCode(ts_code)) || {};
    if (!(etfDailys && etfAdj)) {
      return null;
    }
    const lastEtfDaily = etfDailys[0];
    const etfDailyMap = {};
    etfDailys.forEach((daily) => {
      etfDailyMap[daily.trade_date] = daily;
    });
    // 对每个交易记录进行前复权（调用adjEtfRow直接修改原对象，不需要重新赋值）
    Object.keys(etfDailyMap).forEach((trade_date) => {
      const curEtfDaily = etfDailyMap[trade_date];
      const curEtfAdj = etfAdj[trade_date];
      this.adjEtfRow(curEtfDaily, curEtfAdj, lastEtfAdj);
    });
    this.adjEtfRow(lastEtfDaily, etfAdj[lastEtfDaily.trade_date], lastEtfAdj);
    return {
      etfDaily: etfDailyMap,
      lastEtfDaily: lastEtfDaily,
    };
  }

  public async getEtfDailyByTsCodeAfterAdj(ts_code: string): Promise<{
    etfDaily: { [trade_date: string]: FundDailyResult };
    lastEtfDaily: FundDailyResult;
  } | null> {
    // 先从缓存中拿
    const cacheEtfDaily =
      (await this.cacheManager.get(CACHE_KEY.ETF_DAILYS)) || {};
    const cacheEtfDailyLast =
      (await this.cacheManager.get(CACHE_KEY.ETF_DAILY_LASTS)) || {};
    if (cacheEtfDaily[ts_code] && cacheEtfDailyLast[ts_code])
      return {
        etfDaily: cacheEtfDaily[ts_code],
        lastEtfDaily: cacheEtfDailyLast[ts_code],
      };
    const { etfDaily: etfDaily, lastEtfDaily: lastEtfDaily } =
      (await this.fetchEtfDailyByTsCodeAfterAdj(ts_code)) || {};
    if (!etfDaily) {
      return null;
    }
    // 缓存
    cacheEtfDaily[ts_code] = etfDaily;
    await this.cacheManager.set(CACHE_KEY.ETF_DAILYS, cacheEtfDaily, {
      ttl: 24 * 60 * 60,
    });
    cacheEtfDailyLast[ts_code] = lastEtfDaily;
    await this.cacheManager.set(CACHE_KEY.ETF_DAILY_LASTS, cacheEtfDailyLast, {
      ttl: 24 * 60 * 60,
    });
    return {
      etfDaily: etfDaily,
      lastEtfDaily: lastEtfDaily,
    };
  }
}
