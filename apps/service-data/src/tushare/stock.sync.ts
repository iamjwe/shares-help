import StockBasic from '@/tushare/stock/base/stock_basic.entity';
import AdjFactor from '@/tushare/stock/quotes/adj_factor.entity';
import DailyBasic from '@/tushare/stock/quotes/daily_basic.entity';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import Daily from '@/tushare/stock/quotes/daily.entity';
import Weekly from '@/tushare/stock/quotes/weekly.entity';
import Monthly from '@/tushare/stock/quotes/monthly.entity';
import BaseData from './base.data';
import BaseDataUtil from './base.util';
import {
  addDay,
  geeMonthEnd,
  geeMonthStart,
  getNowDate,
  getWeekEnd,
  getWeekStart,
  spliceByYear,
  subDay,
} from '@/utils/date';
import { getAdjFactor } from '@/tushare/stock/quotes/adj_factor';
import { getDailyBasic } from '@/tushare/stock/quotes/daily_basic';
import { getDaily } from '@/tushare/stock/quotes/daily';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isTradeDayAfterHour } from '@/utils/time';

export const CACHE_KEY_STOCK_DATA_SYNC = {
  STOCK_BASIC_READY: 'stock_basic_ready',
  ADJ_FACTOR_READY: 'adj_factor_ready',
  DAILY_BASIC_READY: 'daily_basic_ready',
  DAILY_READY: 'daily_ready',
  WEEKLY_READY: 'weekly_ready',
  MONTHLY_READY: 'monthly_ready',
};

// 同步Tuhsare数据到数据库中
@Injectable()
export class StockDataSync implements OnModuleInit {
  useMyDb: boolean;
  token: string;
  tradeCalBegin: string;
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
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    @Inject(ConfigService) private readonly configServices: ConfigService,
    private readonly baseData: BaseData,
    private readonly baseDataUtil: BaseDataUtil,
  ) {
    const { useMyDb, token, tradeCalBegin } =
      this.configServices.get('tushare');
    this.token = token;
    this.tradeCalBegin = tradeCalBegin; // 获取量化日历和量化数据的开始日期
    this.useMyDb = useMyDb;
  }

  @Cron('0 0 19 * * 1-5') // 所有需检查数据项的最后更新时间
  async onModuleInit() {
    if (this.useMyDb) {
      console.log('开始进行股票数据完整性校验');
      //   启动时/每天多少点检查数据是否实时是否可靠，如果不可靠控制台输出警告
      let stock_basic_ready;
      let adj_factor_ready;
      let daily_basic_ready;
      let daily_ready;
      let weekly_ready;
      let monthly_ready;
      const pArr = [
        this.checkStockBasicReady(),
        this.checkAdjFactorReady(),
        this.checkDailyBasicReady(),
        this.checkDailyReady(),
        this.checkWeeklyReady(),
        this.checkMonthlyReady(),
      ];
      await Promise.all(pArr).then((values) => {
        stock_basic_ready = values[0];
        adj_factor_ready = values[1];
        daily_basic_ready = values[2];
        daily_ready = values[3];
        weekly_ready = values[4];
        monthly_ready = values[5];
        console.log('结束股票数据完整性校验');
      });
    }
  }

  async checkStockBasicReady(): Promise<boolean> {
    const stock_basic_ready = false;
    await this.cacheManager.set(
      CACHE_KEY_STOCK_DATA_SYNC.STOCK_BASIC_READY,
      stock_basic_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return stock_basic_ready;
  }

  async fillAdjFactorDataByTradesDates(tradeDates: string[]): Promise<void> {
    const adjFactors = [];
    const tradeCal = await this.baseData.getTradeCal();
    const pArr = [];
    for (let j = 0; j < tradeDates.length; j++) {
      const trade_date = tradeDates[j];
      if (tradeCal[trade_date].is_open === 1) {
        pArr.push(
          getAdjFactor(this.token, {
            trade_date,
          }).catch((e) => {
            console.log(`adjFactor数据抓取错误，请检查日期${trade_date}`);
          }),
        );
      }
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        adjFactors.push(...val);
      });
    });
    for (let i = 0; i < adjFactors.length; i += 1000) {
      const tempArr = adjFactors.slice(i, i + 1000);
      await this.adjFactorRepository.save(tempArr);
    }
  }

  async fillAdjFactorData(startDate: string, endDate: string): Promise<void> {
    const datesSpliceByYear = spliceByYear(startDate, endDate);
    const years = Object.keys(datesSpliceByYear);
    for (let i = 0; i < years.length; i++) {
      const tradeDates = datesSpliceByYear[years[i]];
      await this.fillAdjFactorDataByTradesDates(tradeDates);
    }
  }

  async checkAdjFactorReady(): Promise<boolean> {
    let adj_factor_ready = false;
    const needStartDate = (
      await this.baseDataUtil.utilGetAfterTradeDates(this.tradeCalBegin, 1)
    )[0];
    const needEndDate = (
      await this.baseDataUtil.utilGetBeforeTradeDates(getNowDate(), 1)
    )[0];
    // 数据库中数据的时间范围判断: [最小值, 最大值]
    const { startDate, endDate } = (
      await this.dailyBasicRepository.query(
        `select min(trade_date) as startDate, max(trade_date) as endDate from adj_factor;`,
      )
    )[0];
    // case1：数据库没有数据
    if (!(startDate && endDate)) {
      console.log(
        `adj_factor数据填充开始，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
      );
      this.fillAdjFactorData(needStartDate, needEndDate).then(() => {
        console.log(
          `adj_factor数据填充结束，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      });
    } else if (startDate > needStartDate || endDate < needEndDate) {
      //case2：数据库中数据不全
      if (startDate > needStartDate) {
        console.log(
          `adj_factor数据补充开始，开始日期: ${needStartDate}，结束日期: ${subDay(
            startDate,
          )}`,
        );
        this.fillAdjFactorData(needStartDate, subDay(startDate)).then(() => {
          console.log(
            `adj_factor数据补充结束，开始日期: ${needStartDate}，结束日期: ${subDay(
              startDate,
            )}`,
          );
        });
      }
      if (endDate < needEndDate) {
        console.log(
          `adj_factor数据补充开始，开始日期: ${addDay(
            endDate,
          )}，结束日期: ${needEndDate}`,
        );
        this.fillAdjFactorData(addDay(endDate), needEndDate).then(() => {
          console.log(
            `adj_factor数据补充结束，开始日期: ${addDay(
              endDate,
            )}，结束日期: ${needEndDate}`,
          );
        });
      }
    } else {
      const need_trade_dates =
        await this.baseDataUtil.utilGetTradeDatesByRangeDate(
          needStartDate,
          needEndDate,
        );
      const db_trade_dates = (
        await this.adjFactorRepository.query(
          `SELECT DISTINCT(trade_date) FROM adj_factor WHERE trade_date BETWEEN '${needStartDate}' AND '${needEndDate}';`,
        )
      ).map((obj) => {
        return obj.trade_date;
      });
      const diff_trade_dates = need_trade_dates.filter((trade_date) => {
        return !db_trade_dates.includes(trade_date);
      });
      if (diff_trade_dates.length !== 0) {
        console.log(
          `adj_factor数据补充开始，日期枚举: ${diff_trade_dates.join(',')}`,
        );
        this.fillAdjFactorDataByTradesDates(diff_trade_dates).then(() => {
          console.log(
            `adj_factor数据补充结束，日期枚举: ${diff_trade_dates.join(',')}`,
          );
        });
      } else {
        adj_factor_ready = true;
        console.log(
          `adj_factor数据校验完整，交易日总数：${db_trade_dates.length}，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      }
    }
    await this.cacheManager.set(
      CACHE_KEY_STOCK_DATA_SYNC.ADJ_FACTOR_READY,
      adj_factor_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return adj_factor_ready;
  }

  async fillDailyBasicDataByTradesDates(tradeDates: string[]): Promise<void> {
    const dailyBasics = [];
    const tradeCal = await this.baseData.getTradeCal();
    const pArr = [];
    for (let j = 0; j < tradeDates.length; j++) {
      const trade_date = tradeDates[j];
      if (tradeCal[trade_date].is_open === 1) {
        pArr.push(
          getDailyBasic(this.token, {
            trade_date,
          }).catch((e) => {
            console.log(`dailyBasic数据抓取错误，请检查日期${trade_date}`);
          }),
        );
      }
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        dailyBasics.push(...val);
      });
    });
    for (let i = 0; i < dailyBasics.length; i += 1000) {
      const tempArr = dailyBasics.slice(i, i + 1000);
      await this.dailyBasicRepository.save(tempArr);
    }
  }

  async fillDailyBasicData(startDate: string, endDate: string): Promise<void> {
    const datesSpliceByYear = spliceByYear(startDate, endDate);
    const years = Object.keys(datesSpliceByYear);
    for (let i = 0; i < years.length; i++) {
      const tradeDates = datesSpliceByYear[years[i]];
      await this.fillDailyBasicDataByTradesDates(tradeDates);
    }
  }

  async checkDailyBasicReady(): Promise<boolean> {
    let daily_basic_ready = false;
    const needStartDate = (
      await this.baseDataUtil.utilGetAfterTradeDates(this.tradeCalBegin, 1)
    )[0];
    // TODO:超过五点包含当天，不超过不包含
    const needEndDate = (
      await this.baseDataUtil.utilGetBeforeTradeDates(
        isTradeDayAfterHour(new Date(), 19)
          ? addDay(getNowDate())
          : getNowDate(),
        1,
      )
    )[0];
    // 数据库中数据的时间范围判断: [最小值, 最大值]
    const { startDate, endDate } = (
      await this.dailyBasicRepository.query(
        `select min(trade_date) as startDate, max(trade_date) as endDate from daily_basic;`,
      )
    )[0];
    // case1：数据库没有数据
    if (!(startDate && endDate)) {
      console.log(
        `daily_basic数据填充开始，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
      );
      this.fillDailyBasicData(needStartDate, needEndDate).then(() => {
        console.log(
          `daily_basic数据填充结束，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      });
    } else if (startDate > needStartDate || endDate < needEndDate) {
      //case2：数据库中数据不全
      if (startDate > needStartDate) {
        console.log(
          `daily_basic数据补充开始，开始日期: ${needStartDate}，结束日期: ${subDay(
            startDate,
          )}`,
        );
        this.fillDailyBasicData(needStartDate, subDay(startDate)).then(() => {
          console.log(
            `daily_basic数据补充结束，开始日期: ${needStartDate}，结束日期: ${subDay(
              startDate,
            )}`,
          );
        });
      }
      if (endDate < needEndDate) {
        console.log(
          `daily_basic数据补充开始，开始日期: ${addDay(
            endDate,
          )}，结束日期: ${needEndDate}`,
        );
        this.fillDailyBasicData(addDay(endDate), needEndDate).then(() => {
          console.log(
            `daily_basic数据补充结束，开始日期: ${addDay(
              endDate,
            )}，结束日期: ${needEndDate}`,
          );
        });
      }
    } else {
      const need_trade_dates =
        await this.baseDataUtil.utilGetTradeDatesByRangeDate(
          needStartDate,
          needEndDate,
        );
      const db_trade_dates = (
        await this.dailyBasicRepository.query(
          `SELECT DISTINCT(trade_date) FROM daily_basic WHERE trade_date BETWEEN '${needStartDate}' AND '${needEndDate}';`,
        )
      ).map((obj) => {
        return obj.trade_date;
      });
      const diff_trade_dates = need_trade_dates.filter((trade_date) => {
        return !db_trade_dates.includes(trade_date);
      });
      if (diff_trade_dates.length !== 0) {
        console.log(
          `daily_basic数据补充开始，日期枚举: ${diff_trade_dates.join(',')}`,
        );
        this.fillDailyBasicDataByTradesDates(diff_trade_dates).then(() => {
          console.log(
            `daily_basic数据补充结束，日期枚举: ${diff_trade_dates.join(',')}`,
          );
        });
      } else {
        daily_basic_ready = true;
        console.log(
          `daily_basic数据校验完整，交易日总数：${db_trade_dates.length}，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      }
    }
    await this.cacheManager.set(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_BASIC_READY,
      daily_basic_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return daily_basic_ready;
  }

  async fillDailyDataByTradesDates(tradeDates: string[]): Promise<void> {
    const dailys = [];
    const tradeCal = await this.baseData.getTradeCal();
    const pArr = [];
    for (let j = 0; j < tradeDates.length; j++) {
      const trade_date = tradeDates[j];
      if (tradeCal[trade_date].is_open === 1) {
        pArr.push(
          getDaily(this.token, {
            trade_date,
          }).catch((e) => {
            console.log(`daily数据抓取错误，请检查日期${trade_date}`);
          }),
        );
      }
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        dailys.push(...val);
      });
    });
    for (let i = 0; i < dailys.length; i += 5000) {
      const tempArr = dailys.slice(i, i + 5000);
      await this.dailyRepository.save(tempArr);
    }
  }

  async fillDailyData(startDate: string, endDate: string): Promise<void> {
    const datesSpliceByYear = spliceByYear(startDate, endDate);
    const years = Object.keys(datesSpliceByYear);
    for (let i = 0; i < years.length; i++) {
      const tradeDates = datesSpliceByYear[years[i]];
      await this.fillDailyDataByTradesDates(tradeDates);
    }
  }

  async checkDailyReady(): Promise<boolean> {
    let daily_ready = false;
    const needStartDate = (
      await this.baseDataUtil.utilGetAfterTradeDates(this.tradeCalBegin, 1)
    )[0];
    // TODO:超过五点包含当天，不超过不包含
    const needEndDate = (
      await this.baseDataUtil.utilGetBeforeTradeDates(
        isTradeDayAfterHour(new Date(), 19)
          ? addDay(getNowDate())
          : getNowDate(),
        1,
      )
    )[0];
    // 数据库中数据的时间范围判断: [最小值, 最大值]
    const { startDate, endDate } = (
      await this.dailyRepository.query(
        `select min(trade_date) as startDate, max(trade_date) as endDate from daily;`,
      )
    )[0];
    // case1：数据库没有数据
    if (!(startDate && endDate)) {
      console.log(
        `daily数据填充开始，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
      );
      this.fillDailyData(needStartDate, needEndDate).then(() => {
        console.log(
          `daily数据填充结束，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      });
    } else if (startDate > needStartDate || endDate < needEndDate) {
      //case2：数据库中数据不全
      if (startDate > needStartDate) {
        console.log(
          `daily数据补充开始，开始日期: ${needStartDate}，结束日期: ${subDay(
            startDate,
          )}`,
        );
        this.fillDailyData(needStartDate, subDay(startDate)).then(() => {
          console.log(
            `daily数据补充结束，开始日期: ${needStartDate}，结束日期: ${subDay(
              startDate,
            )}`,
          );
        });
      }
      if (endDate < needEndDate) {
        console.log(
          `daily数据补充开始，开始日期: ${addDay(
            endDate,
          )}，结束日期: ${needEndDate}`,
        );
        this.fillDailyData(addDay(endDate), needEndDate).then(() => {
          console.log(
            `daily数据补充结束，开始日期: ${addDay(
              endDate,
            )}，结束日期: ${needEndDate}`,
          );
        });
      }
    } else {
      const need_trade_dates =
        await this.baseDataUtil.utilGetTradeDatesByRangeDate(
          needStartDate,
          needEndDate,
        );
      const db_trade_dates = (
        await this.dailyRepository.query(
          `SELECT DISTINCT(trade_date) FROM daily WHERE trade_date BETWEEN '${needStartDate}' AND '${needEndDate}';`,
        )
      ).map((obj) => {
        return obj.trade_date;
      });
      const diff_trade_dates = need_trade_dates.filter((trade_date) => {
        return !db_trade_dates.includes(trade_date);
      });
      if (diff_trade_dates.length !== 0) {
        console.log(
          `daily数据补充开始，日期枚举: ${diff_trade_dates.join(',')}`,
        );
        this.fillDailyDataByTradesDates(diff_trade_dates).then(() => {
          console.log(
            `daily数据补充结束，日期枚举: ${diff_trade_dates.join(',')}`,
          );
        });
      } else {
        daily_ready = true;
        console.log(
          `daily数据校验完整，交易日总数：${db_trade_dates.length}，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      }
    }
    await this.cacheManager.set(
      CACHE_KEY_STOCK_DATA_SYNC.DAILY_READY,
      daily_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return daily_ready;
  }

  // 周尾交易日会因为个股不同而不同
  async checkWeeklyReady(): Promise<boolean> {
    const weekly_ready = false;
    await this.cacheManager.set(
      CACHE_KEY_STOCK_DATA_SYNC.WEEKLY_READY,
      weekly_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return weekly_ready;
  }

  // 月尾交易日会因为个股不同而不同
  async checkMonthlyReady(): Promise<boolean> {
    const monthly_ready = false;
    await this.cacheManager.set(
      CACHE_KEY_STOCK_DATA_SYNC.MONTHLY_READY,
      monthly_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return monthly_ready;
  }
}
