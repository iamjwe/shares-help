import {
  getStockBasic,
  StockBasicResult,
} from '@/tushare/stock/base/stock_basic';
import StockBasic from '@/tushare/stock/base/stock_basic.entity';
import {
  AdjFactorResult,
  getAdjFactor,
} from '@/tushare/stock/quotes/adj_factor';
import AdjFactor from '@/tushare/stock/quotes/adj_factor.entity';
import { DailyResult, getDaily } from '@/tushare/stock/quotes/daily';
import Daily from '@/tushare/stock/quotes/daily.entity';
import {
  DailyBasicResult,
  getDailyBasic,
} from '@/tushare/stock/quotes/daily_basic';
import DailyBasic from '@/tushare/stock/quotes/daily_basic.entity';
import { getMonthly, MonthlyResult } from '@/tushare/stock/quotes/monthly';
import Monthly from '@/tushare/stock/quotes/monthly.entity';
import { getWeekly, WeeklyResult } from '@/tushare/stock/quotes/weekly';
import Weekly from '@/tushare/stock/quotes/weekly.entity';
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
import { CACHE_KEY_STOCK_DATA_SYNC } from './stock.sync';
import { Cron, CronExpression } from '@nestjs/schedule';

export const CACHE_KEY = {
  STOCK_BASICS: 'stock_basic',
  STOCK_CODES: 'stock_codes',
  STOCK_ADJS: 'stock_adjs',
  STOCK_ADJ_LASTS: 'stock_adj_lasts',
  STOCK_DAILY_BASICS: 'stock_daily_basics',
  STOCK_DAILY_BASIC_LASTS: 'stock_daily_basic_lasts',
  STOCK_DAILY_BASIC_All: 'stock_daily_basics_all',
  STOCK_DAILYS: 'stock_dailys',
  STOCK_DAILY_LASTS: 'stock_daily_lasts',
  STOCK_WEEKLYS: 'stock_weeklys',
  STOCK_WEEKLY_LASTS: 'stock_weekly_lasts',
  STOCK_MONTHLYS: 'stock_monthlys',
  STOCK_MONTHLY_LASTS: 'stock_monthly_lasts',
};

// private fetch系列抓取数据，get系列提供给外部调用（会利用缓存）
@Injectable()
export default class StockData implements OnApplicationBootstrap {
  token: string;
  tradeCalBegin: string;
  presetCache: string;
  constructor(
    @InjectRepository(StockBasic)
    private stockBasicRepository: Repository<StockBasic>,
    @InjectRepository(AdjFactor)
    private adjFactorRepository: Repository<AdjFactor>,
    @InjectRepository(DailyBasic)
    private dailyBasicRepository: Repository<DailyBasic>,
    @InjectRepository(Daily)
    private dailyRepository: Repository<Daily>,
    @InjectRepository(Weekly)
    private weeklyRepository: Repository<Weekly>,
    @InjectRepository(Monthly)
    private monthlyRepository: Repository<Monthly>,
    @Inject(ConfigService) public readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {
    const { token, tradeCalBegin, presetCache } =
      this.configService.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
    this.presetCache = presetCache;
  }

  async onApplicationBootstrap() {
    // 提高初次缓存速度：主动拉取数据库数据批量缓存，避免过多连接时的查询等待
    await Promise.all([
      this.presetCacheAdjs(),
      this.presetCacheDaily(),
      // this.presetCacheDailyBasic(),  // error：Last few GCs，单独预缓存不报错，3个同时预缓存的话就报错
    ]);
  }

  @Cron('0 15 19 * * 1-5')
  async clearCache() {
    await this.cacheManager.del(CACHE_KEY.STOCK_DAILY_BASICS);
    await this.cacheManager.del(CACHE_KEY.STOCK_DAILY_BASIC_All);
    await this.cacheManager.del(CACHE_KEY.STOCK_DAILY_BASIC_LASTS);
    await this.cacheManager.del(CACHE_KEY.STOCK_ADJS);
    await this.cacheManager.del(CACHE_KEY.STOCK_ADJ_LASTS);
    await this.cacheManager.del(CACHE_KEY.STOCK_DAILYS);
    await this.cacheManager.del(CACHE_KEY.STOCK_DAILY_LASTS);
  }

  async presetCacheDaily() {
    const beginTime = Number(new Date());
    const haveStoreForDaily = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_READY,
    );
    console.log(`开始预缓存daily`);
    if (haveStoreForDaily) {
      const cacheStockDailys = {};
      const cacheStockDailyLast = {};
      const tsCodeDailysMap = {};
      const storeDaily = (await this.dailyRepository.query(`
      SELECT * FROM daily WHERE trade_date >= ${this.tradeCalBegin} ORDER BY trade_date DESC;`)) as DailyResult[];
      storeDaily.forEach((dailys) => {
        const ts_code = dailys.ts_code;
        if (!tsCodeDailysMap[ts_code]) {
          tsCodeDailysMap[ts_code] = [];
        }
        tsCodeDailysMap[ts_code].push(dailys);
      });
      Object.keys(tsCodeDailysMap).forEach((ts_code) => {
        const curTsCodeDailys = tsCodeDailysMap[ts_code];
        const lastDaily = curTsCodeDailys[0];
        cacheStockDailyLast[ts_code] = lastDaily;
        const dailysMap = {};
        curTsCodeDailys.forEach((adj) => {
          dailysMap[adj.trade_date] = adj;
        });
        cacheStockDailys[ts_code] = dailysMap;
      });
      await this.cacheManager.set(CACHE_KEY.STOCK_DAILYS, cacheStockDailys, {
        ttl: 24 * 60 * 60,
      });
      await this.cacheManager.set(
        CACHE_KEY.STOCK_DAILY_LASTS,
        cacheStockDailyLast,
        {
          ttl: 24 * 60 * 60,
        },
      );
      console.log(
        `预缓存daily结束，缓存开始日期：${this.tradeCalBegin}，耗时：${
          Number(new Date()) - beginTime
        }`,
      );
    }
  }

  async presetCacheDailyBasic() {
    const beginTime = Number(new Date());
    const haveStoreForDailyBasics = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_BASIC_READY,
    );
    console.log(`开始预缓存daily_basic`);
    if (haveStoreForDailyBasics) {
      const cacheStockBasicAll = {};
      const storeDailyBasics = (await this.dailyBasicRepository.query(`
      SELECT * FROM daily_basic WHERE trade_date >= ${this.tradeCalBegin} ORDER BY trade_date DESC;`)) as AdjFactorResult[];
      storeDailyBasics.forEach((dailyBasics) => {
        const trade_date = dailyBasics.trade_date;
        if (!cacheStockBasicAll[trade_date]) {
          cacheStockBasicAll[trade_date] = [];
        }
        cacheStockBasicAll[trade_date].push(dailyBasics);
      });
      await this.cacheManager.set(
        CACHE_KEY.STOCK_DAILY_BASIC_All,
        cacheStockBasicAll,
        {
          ttl: 24 * 60 * 60,
        },
      );
      console.log(
        `预缓存daily_basic结束，缓存开始日期：${this.presetCache}，耗时：${
          Number(new Date()) - beginTime
        }`,
      );
    }
  }

  async presetCacheAdjs() {
    const beginTime = Number(new Date());
    const haveStoreForAdjFactor = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.ADJ_FACTOR_READY,
    );
    console.log(`开始预缓存adj_factor`);
    if (haveStoreForAdjFactor) {
      const cacheStockAdjs = {};
      const cacheStockAdjLast = {};
      const tsCodeAdjsMap = {};
      const storeAdjs = (await this.adjFactorRepository.query(`
      SELECT * FROM adj_factor WHERE trade_date >= ${this.tradeCalBegin} ORDER BY trade_date DESC;`)) as AdjFactorResult[];
      storeAdjs.forEach((adjs) => {
        const ts_code = adjs.ts_code;
        if (!tsCodeAdjsMap[ts_code]) {
          tsCodeAdjsMap[ts_code] = [];
        }
        tsCodeAdjsMap[ts_code].push(adjs);
      });
      Object.keys(tsCodeAdjsMap).forEach((ts_code) => {
        const curTsCodeAdjs = tsCodeAdjsMap[ts_code];
        const lastAdj = curTsCodeAdjs[0];
        cacheStockAdjLast[ts_code] = lastAdj;
        const adjFactor = {};
        curTsCodeAdjs.forEach((adj) => {
          adjFactor[adj.trade_date] = adj;
        });
        cacheStockAdjs[ts_code] = adjFactor;
      });
      await this.cacheManager.set(CACHE_KEY.STOCK_ADJS, cacheStockAdjs, {
        ttl: 24 * 60 * 60,
      });
      await this.cacheManager.set(
        CACHE_KEY.STOCK_ADJ_LASTS,
        cacheStockAdjLast,
        {
          ttl: 24 * 60 * 60,
        },
      );
      console.log(
        `预缓存adj_factor结束，缓存开始日期：${this.tradeCalBegin}，耗时：${
          Number(new Date()) - beginTime
        }`,
      );
    }
  }

  private async fetchStockBasic(): Promise<{
    stockBasics: { [ts_code: string]: StockBasicResult };
    stockCodes: string[];
  } | null> {
    let stockBasics;
    const haveStoreForStockBasics = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.STOCK_BASIC_READY,
    );
    if (haveStoreForStockBasics) {
      const storeStockBasics =
        (await this.stockBasicRepository.find()) as StockBasicResult[];
      stockBasics = storeStockBasics;
    } else {
      stockBasics = await getStockBasic(this.token, {});
    }
    if (!stockBasics) {
      return null;
    }
    const stockBasicsMap = {};
    stockBasics.forEach((row: StockBasicResult) => {
      stockBasicsMap[row.ts_code] = row;
    });
    const stockCodes = stockBasics.map((stockBasic: StockBasicResult) => {
      return stockBasic.ts_code;
    });
    return {
      stockBasics: stockBasicsMap,
      stockCodes,
    };
  }

  // 获取股票的基本信息
  public async getStockBasic(): Promise<{
    [ts_code: string]: StockBasicResult;
  } | null> {
    // 先从缓存中拿
    const cacheStockBasics = await this.cacheManager.get(
      CACHE_KEY.STOCK_BASICS,
    );
    if (cacheStockBasics) return cacheStockBasics;
    const { stockBasics } = (await this.fetchStockBasic()) || {};
    if (!stockBasics) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.STOCK_BASICS, stockBasics, {
      ttl: 24 * 60 * 60,
    });
    return stockBasics;
  }

  // 获取所有股票的代码
  public async getStockCodes(): Promise<string[] | null> {
    const cacheStockCodes = await this.cacheManager.get(CACHE_KEY.STOCK_CODES);
    if (cacheStockCodes) return cacheStockCodes;
    const { stockCodes } = (await this.fetchStockBasic()) || {};
    if (!stockCodes) {
      return null;
    }
    await this.cacheManager.set(CACHE_KEY.STOCK_CODES, stockCodes, {
      ttl: 24 * 60 * 60,
    });
    return stockCodes;
  }

  private async fetchAdjFactorByTsCode(ts_code: string): Promise<{
    adjFactor: { [trade_date: string]: AdjFactorResult };
    lastAdj: AdjFactorResult;
  } | null> {
    let adjs;
    const haveStoreForAdjFactor = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.ADJ_FACTOR_READY,
    );
    if (haveStoreForAdjFactor) {
      const beginTime = Number(new Date());
      const storeAdjs = (await this.adjFactorRepository.query(`
      SELECT * FROM adj_factor WHERE ts_code = "${ts_code}" AND trade_date >= ${this.tradeCalBegin} ORDER BY trade_date DESC;`)) as AdjFactorResult[];
      adjs = storeAdjs;
      // TODO 瓶颈：拉取数据需要两秒，navicat拉取数据很快，程序很慢。考虑是否连接数过多的问题。
      // if (ts_code === '605123.SH') {
      //   console.log('time', Number(new Date()) - beginTime);
      // }
    } else {
      adjs = await getAdjFactor(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    // 最新复权因子
    if (!adjs) {
      return null;
    }
    const lastAdj = adjs[0];
    const adjFactor = {};
    adjs.forEach((adj) => {
      adjFactor[adj.trade_date] = adj;
    });
    return {
      adjFactor,
      lastAdj,
    };
  }

  public async getAdjFactorByTsCode(ts_code: string): Promise<{
    adjFactor: { [trade_date: string]: AdjFactorResult };
    lastAdj: AdjFactorResult;
  } | null> {
    // 先从缓存中拿
    const cacheStockAdjs =
      (await this.cacheManager.get(CACHE_KEY.STOCK_ADJS)) || {};
    const cacheStockAdjLast =
      (await this.cacheManager.get(CACHE_KEY.STOCK_ADJ_LASTS)) || {};
    if (cacheStockAdjs[ts_code] && cacheStockAdjLast[ts_code]) {
      return {
        adjFactor: cacheStockAdjs[ts_code],
        lastAdj: cacheStockAdjLast[ts_code],
      };
    }
    // 缓存中没有
    const { adjFactor, lastAdj } =
      (await this.fetchAdjFactorByTsCode(ts_code)) || {};
    if (!adjFactor) {
      return null;
    }
    // 把该ts_code的adj数据加入缓存当中
    cacheStockAdjs[ts_code] = adjFactor;
    await this.cacheManager.set(CACHE_KEY.STOCK_ADJS, cacheStockAdjs, {
      ttl: 24 * 60 * 60,
    });
    // 把该ts_code的最新adj数据加入缓存当中
    cacheStockAdjLast[ts_code] = lastAdj;
    await this.cacheManager.set(CACHE_KEY.STOCK_ADJ_LASTS, cacheStockAdjLast, {
      ttl: 24 * 60 * 60,
    });
    return {
      adjFactor,
      lastAdj,
    };
  }

  public async cacheGetAdjFactorByTsCodes(ts_codes: string[]): Promise<void> {
    const pArr = [];
    // 异步发出多个请求，设置进缓存当中即可
    for (let i = 0; i < ts_codes.length; i++) {
      const ts_code = ts_codes[i];
      const adjsP = this.fetchAdjFactorByTsCode(ts_code);
      pArr.push(adjsP);
    }
    await Promise.all(pArr).then(async (values) => {
      for (let i = 0; i < values.length; i++) {
        const adjs: {
          adjFactor: { [trade_date: string]: AdjFactorResult };
          lastAdj: AdjFactorResult;
        } = values[i];
        // 最新复权因子
        const ts_code = adjs.lastAdj.ts_code;
        // 把该ts_code的adj数据加入缓存当中
        const cacheStockAdjs =
          (await this.cacheManager.get(CACHE_KEY.STOCK_ADJS)) || {};
        cacheStockAdjs[ts_code] = adjs.adjFactor;
        await this.cacheManager.set(CACHE_KEY.STOCK_ADJS, cacheStockAdjs, {
          ttl: 24 * 60 * 60,
        });
        // 把该ts_code的最新adj数据加入缓存当中
        const cacheLastAdj =
          (await this.cacheManager.get(CACHE_KEY.STOCK_ADJ_LASTS)) || {};
        cacheLastAdj[ts_code] = adjs.lastAdj;
        await this.cacheManager.set(CACHE_KEY.STOCK_ADJ_LASTS, cacheLastAdj, {
          ttl: 24 * 60 * 60,
        });
      }
    });
  }

  private async fetchDailyBasicByTradeDate(
    trade_date: string,
  ): Promise<DailyBasicResult[] | null> {
    let dailyBasics;
    const haveStoreForDailyBasics = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_BASIC_READY,
    );
    if (haveStoreForDailyBasics) {
      const storeDailyBasics = (await this.dailyBasicRepository.find({
        where: { trade_date },
        order: { trade_date: 'DESC' },
      })) as DailyBasicResult[];
      dailyBasics = storeDailyBasics;
    } else {
      dailyBasics = await getDailyBasic(this.token, {
        trade_date,
      });
    }
    if (!dailyBasics) {
      return null;
    }
    return dailyBasics;
  }

  // 根据日期拿每日指标，主要用于过滤得到股票池
  public async getDailyBasicByTradeDate(
    trade_date: string,
  ): Promise<DailyBasicResult[] | null> {
    const cacheStockBasicAll =
      (await this.cacheManager.get(CACHE_KEY.STOCK_DAILY_BASIC_All)) || {};
    if (cacheStockBasicAll[trade_date]) {
      return cacheStockBasicAll[trade_date];
    }
    const dailyBasics = await this.fetchDailyBasicByTradeDate(trade_date);
    if (!dailyBasics) {
      return null;
    }
    cacheStockBasicAll[trade_date] = dailyBasics;
    await this.cacheManager.set(
      CACHE_KEY.STOCK_DAILY_BASIC_All,
      cacheStockBasicAll,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return dailyBasics;
  }

  private async fetchDailyBasicByTsCode(ts_code: string): Promise<{
    dailyBasic: { [trade_date: string]: DailyBasicResult };
    lastDailyBasic: DailyBasicResult;
  } | null> {
    let dailyBasic;
    const haveStoreForDailyBasic = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_BASIC_READY,
    );
    if (haveStoreForDailyBasic) {
      const storeDailyBasic = (await this.dailyBasicRepository.find({
        where: { ts_code, trade_date: MoreThanOrEqual(this.tradeCalBegin) },
        order: { trade_date: 'DESC' },
      })) as DailyBasicResult[];
      dailyBasic = storeDailyBasic;
    } else {
      dailyBasic = await getDailyBasic(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    if (!dailyBasic) {
      return null;
    }
    const lastDailyBasic = dailyBasic[0];
    const dailyBasicMap = {};
    dailyBasic.forEach((item) => {
      dailyBasicMap[item.trade_date] = item;
    });
    return {
      dailyBasic: dailyBasicMap,
      lastDailyBasic,
    };
  }

  public async getDailyBasicByTsCode(ts_code: string): Promise<{
    dailyBasic: { [trade_date: string]: DailyBasicResult };
    lastDailyBasic: DailyBasicResult;
  } | null> {
    const cacheStockBasics =
      (await this.cacheManager.get(CACHE_KEY.STOCK_DAILY_BASICS)) || {};
    const cacheStockBasicLasts =
      (await this.cacheManager.get(CACHE_KEY.STOCK_DAILY_BASIC_LASTS)) || {};
    if (cacheStockBasics[ts_code] && cacheStockBasicLasts[ts_code]) {
      return {
        dailyBasic: cacheStockBasics[ts_code],
        lastDailyBasic: cacheStockBasicLasts[ts_code],
      };
    }
    const { dailyBasic, lastDailyBasic } =
      (await this.fetchDailyBasicByTsCode(ts_code)) || {};
    if (!dailyBasic) {
      return null;
    }
    cacheStockBasics[ts_code] = dailyBasic;
    cacheStockBasicLasts[ts_code] = lastDailyBasic;
    await this.cacheManager.set(
      CACHE_KEY.STOCK_DAILY_BASICS,
      cacheStockBasics,
      {
        ttl: 24 * 60 * 60,
      },
    );
    await this.cacheManager.set(
      CACHE_KEY.STOCK_DAILY_BASIC_LASTS,
      cacheStockBasicLasts,
      { ttl: 24 * 60 * 60 },
    );
    return {
      dailyBasic,
      lastDailyBasic,
    };
  }

  // 对单个交易记录进行复权
  private adjStockRow(
    stockRow: DailyResult | WeeklyResult | MonthlyResult,
    curAdj: AdjFactorResult,
    lastAdj: AdjFactorResult,
  ): DailyResult | WeeklyResult | MonthlyResult {
    // 往前的时间会没有复权因子，没有复权因子则不做复权。
    // 复权因子于次日更新，所以最新复权因子要隔一日生效且当天的daily数据会没有复权
    if (!(curAdj && lastAdj)) {
      return;
    }
    stockRow.close = (stockRow.close * curAdj.adj_factor) / lastAdj.adj_factor;
    stockRow.open = (stockRow.open * curAdj.adj_factor) / lastAdj.adj_factor;
    stockRow.high = (stockRow.high * curAdj.adj_factor) / lastAdj.adj_factor;
    stockRow.low = (stockRow.low * curAdj.adj_factor) / lastAdj.adj_factor;
    return stockRow;
  }
  // 拉取复权日线数据
  private async fetchStockDailyByTsCodeAfterAdj(ts_code: string): Promise<{
    stockDaily: { [trade_date: string]: DailyResult };
    lastStockDaily: DailyResult;
  } | null> {
    let dailys;
    const haveStoreForDaily = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_READY,
    );
    const pArr = [];
    if (haveStoreForDaily) {
      pArr.push(
        this.dailyRepository.find({
          where: { ts_code, trade_date: MoreThanOrEqual(this.tradeCalBegin) },
        }),
      );
    } else {
      // dailys = await getDaily(this.token, {
      //   ts_code,
      //   start_date: this.tradeCalBegin,
      // });
      pArr.push(
        getDaily(this.token, {
          ts_code,
          start_date: this.tradeCalBegin,
        }),
      );
    }
    // const { adjFactor, lastAdj } =
    //   (await this.getAdjFactorByTsCode(ts_code)) || {};
    let adjFactor, lastAdj;
    pArr.push(this.getAdjFactorByTsCode(ts_code));
    await Promise.all(pArr).then((datas) => {
      dailys = datas[0];
      const curAdjs = datas[1] || {};
      adjFactor = curAdjs.adjFactor;
      lastAdj = curAdjs.lastAdj;
    });
    if (!(dailys && adjFactor)) {
      return null;
    }
    const lastStockDaily = dailys[0];
    const dailyMap = {};
    dailys.forEach((daily) => {
      dailyMap[daily.trade_date] = daily;
    });
    // 对每个交易记录进行前复权（调用adjStockRow直接修改原对象，不需要重新赋值）
    Object.keys(dailyMap).forEach((trade_date) => {
      const curDaily = dailyMap[trade_date];
      const curAdjFactor = adjFactor[trade_date];
      this.adjStockRow(curDaily, curAdjFactor, lastAdj);
    });
    this.adjStockRow(
      lastStockDaily,
      adjFactor[lastStockDaily.trade_date],
      lastAdj,
    );
    return {
      stockDaily: dailyMap,
      lastStockDaily: lastStockDaily,
    };
  }

  // 拉取复权周线数据
  private async fetchStockWeeklyByTsCodeAfterAdj(ts_code: string): Promise<{
    stockWeekly: { [trade_date: string]: WeeklyResult };
    lastStockWeekly: WeeklyResult;
  } | null> {
    let weeklys;
    const haveStoreForWeekly = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.WEEKLY_READY,
    );
    if (haveStoreForWeekly) {
      const storeWeeklys = (await this.weeklyRepository.find({
        where: { ts_code, trade_date: MoreThanOrEqual(this.tradeCalBegin) },
        order: { trade_date: 'DESC' },
      })) as WeeklyResult[];
      weeklys = storeWeeklys;
    } else {
      weeklys = await getWeekly(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    const { adjFactor, lastAdj } =
      (await this.getAdjFactorByTsCode(ts_code)) || {};
    if (!(weeklys && adjFactor)) {
      return null;
    }
    const lastStockWeekly = weeklys[0];
    const weeklyMap = {};
    weeklys.forEach((weekly) => {
      weeklyMap[weekly.trade_date] = weekly;
    });
    // 对每个交易记录进行前复权（调用adjStockRow直接修改原对象，不需要重新赋值）
    Object.keys(weeklyMap).forEach((trade_date) => {
      const curWeekly = weeklyMap[trade_date];
      const curAdjFactor = adjFactor[trade_date];
      this.adjStockRow(curWeekly, curAdjFactor, lastAdj);
    });
    this.adjStockRow(
      lastStockWeekly,
      adjFactor[lastStockWeekly.trade_date],
      lastAdj,
    );
    return {
      stockWeekly: weeklyMap,
      lastStockWeekly: lastStockWeekly,
    };
  }
  // 拉取复权月线数据
  private async fetchStockMonthlyByTsCodeAfterAdj(ts_code: string): Promise<{
    stockMonthly: { [trade_date: string]: MonthlyResult };
    lastStockMonthly: MonthlyResult;
  } | null> {
    let monthlys;
    const haveStoreForMonthly = await this.cacheManager.get(
      CACHE_KEY_STOCK_DATA_SYNC.MONTHLY_READY,
    );
    if (haveStoreForMonthly) {
      const storeMonthlys = (await this.monthlyRepository.find({
        where: { ts_code, trade_date: MoreThanOrEqual(this.tradeCalBegin) },
        order: { trade_date: 'DESC' },
      })) as MonthlyResult[];
      monthlys = storeMonthlys;
    } else {
      monthlys = await getMonthly(this.token, {
        ts_code,
        start_date: this.tradeCalBegin,
      });
    }
    const { adjFactor, lastAdj } =
      (await this.getAdjFactorByTsCode(ts_code)) || {};
    if (!(monthlys && adjFactor)) {
      return null;
    }
    const lastStockMonthly = monthlys[0];
    const monthlyMap = {};
    monthlys.forEach((monthly) => {
      monthlyMap[monthly.trade_date] = monthly;
    });
    // 对每个交易记录进行前复权（调用adjStockRow直接修改原对象，不需要重新赋值）
    Object.keys(monthlyMap).forEach((trade_date) => {
      const curMonthly = monthlyMap[trade_date];
      const curAdjFactor = adjFactor[trade_date];
      this.adjStockRow(curMonthly, curAdjFactor, lastAdj);
    });
    this.adjStockRow(
      lastStockMonthly,
      adjFactor[lastStockMonthly.trade_date],
      lastAdj,
    );
    return {
      stockMonthly: monthlyMap,
      lastStockMonthly: lastStockMonthly,
    };
  }

  public async getStockDailyByTsCodeAfterAdj(ts_code: string): Promise<{
    stockDaily: { [trade_date: string]: DailyResult };
    lastStockDaily: DailyResult;
  } | null> {
    // 先从缓存中拿
    const cacheStockDaily =
      (await this.cacheManager.get(CACHE_KEY.STOCK_DAILYS)) || {};
    const cacheStockDailyLast =
      (await this.cacheManager.get(CACHE_KEY.STOCK_DAILY_LASTS)) || {};
    if (cacheStockDaily[ts_code] && cacheStockDailyLast[ts_code])
      return {
        stockDaily: cacheStockDaily[ts_code],
        lastStockDaily: cacheStockDailyLast[ts_code],
      };
    const { stockDaily, lastStockDaily } =
      (await this.fetchStockDailyByTsCodeAfterAdj(ts_code)) || {};
    if (!stockDaily) {
      return null;
    }
    // 缓存
    cacheStockDaily[ts_code] = stockDaily;
    await this.cacheManager.set(CACHE_KEY.STOCK_DAILYS, cacheStockDaily, {
      ttl: 24 * 60 * 60,
    });
    cacheStockDailyLast[ts_code] = lastStockDaily;
    await this.cacheManager.set(
      CACHE_KEY.STOCK_DAILY_LASTS,
      cacheStockDailyLast,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return {
      stockDaily,
      lastStockDaily,
    };
  }
  public async getStockWeeklyByTsCodeAfterAdj(ts_code: string): Promise<{
    stockWeekly: { [trade_date: string]: WeeklyResult };
    lastStockWeekly: WeeklyResult;
  } | null> {
    // 先从缓存中拿
    const cacheStockWeekly =
      (await this.cacheManager.get(CACHE_KEY.STOCK_WEEKLYS)) || {};
    const cacheStockWeeklyLast =
      (await this.cacheManager.get(CACHE_KEY.STOCK_WEEKLY_LASTS)) || {};
    if (cacheStockWeekly[ts_code] && cacheStockWeeklyLast[ts_code]) {
      return {
        stockWeekly: cacheStockWeekly[ts_code],
        lastStockWeekly: cacheStockWeeklyLast[ts_code],
      };
    }

    const { stockWeekly, lastStockWeekly } =
      (await this.fetchStockWeeklyByTsCodeAfterAdj(ts_code)) || {};
    if (!stockWeekly) {
      return null;
    }
    cacheStockWeekly[ts_code] = stockWeekly;
    await this.cacheManager.set(CACHE_KEY.STOCK_MONTHLYS, cacheStockWeekly, {
      ttl: 24 * 60 * 60,
    });
    cacheStockWeeklyLast[ts_code] = lastStockWeekly;
    await this.cacheManager.set(
      CACHE_KEY.STOCK_MONTHLY_LASTS,
      cacheStockWeeklyLast,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return {
      stockWeekly,
      lastStockWeekly,
    };
  }
  public async getStockMonthlyByTsCodeAfterAdj(ts_code: string): Promise<{
    stockMonthly: { [trade_date: string]: MonthlyResult };
    lastStockMonthly: MonthlyResult;
  } | null> {
    // 先从缓存中拿
    const cacheStockMonthly =
      (await this.cacheManager.get(CACHE_KEY.STOCK_MONTHLYS)) || {};
    const cacheStockMonthlyLast =
      (await this.cacheManager.get(CACHE_KEY.STOCK_MONTHLY_LASTS)) || {};
    if (cacheStockMonthly[ts_code] && cacheStockMonthlyLast[ts_code])
      return {
        stockMonthly: cacheStockMonthly[ts_code],
        lastStockMonthly: cacheStockMonthlyLast[ts_code],
      };
    const { stockMonthly, lastStockMonthly } =
      (await this.fetchStockMonthlyByTsCodeAfterAdj(ts_code)) || {};
    if (!stockMonthly) {
      return null;
    }
    cacheStockMonthly[ts_code] = stockMonthly;
    await this.cacheManager.set(CACHE_KEY.STOCK_MONTHLYS, cacheStockMonthly, {
      ttl: 24 * 60 * 60,
    });
    cacheStockMonthlyLast[ts_code] = lastStockMonthly;
    await this.cacheManager.set(
      CACHE_KEY.STOCK_MONTHLY_LASTS,
      cacheStockMonthlyLast,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return {
      stockMonthly,
      lastStockMonthly,
    };
  }
}
