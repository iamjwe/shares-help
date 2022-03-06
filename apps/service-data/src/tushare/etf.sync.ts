import FundAdj from '@/tushare/fund/fund_adj.entity';
import FundBasic from '@/tushare/fund/fund_basic.entity';
import FundDaily from '@/tushare/fund/fund_daily.entity';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { addDay, getNowDate, spliceByYear, subDay } from '@/utils/date';
import { getFundAdj } from '@/tushare/fund/fund_adj';
import { getFundDaily } from '@/tushare/fund/fund_daily';
import BaseData from './base.data';
import BaseDataUtil from './base.util';
import { isTradeDayAfterHour } from '@/utils/time';

export const CACHE_KEY_ETF_DATA_SYNC = {
  ETF_BASIC_READY: 'etf_basic_ready',
  ETF_ADJ_READY: 'etf_adj_ready',
  ETF_DAILY_READY: 'etf_daily_ready',
};
// 同步Tuhsare数据到数据库中
@Injectable()
export class EtfDataSync implements OnModuleInit {
  useMyDb: boolean;
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(FundBasic)
    private fundBasicRepository: Repository<FundBasic>,
    @InjectRepository(FundAdj)
    private fundAdjRepository: Repository<FundAdj>,
    @InjectRepository(FundDaily)
    private fundDailyRepository: Repository<FundDaily>,
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

  async onModuleInit() {
    if (this.useMyDb) {
      let etf_basic_ready, etf_adj_ready, etf_daily_ready;
      const pArr = [
        this.checkEtfBasicReady(),
        this.checkEtfAdjReady(),
        this.checkEtfDailyReady(),
      ];
      await Promise.all(pArr).then((readys) => {
        etf_basic_ready = readys[0];
        etf_adj_ready = readys[1];
        etf_daily_ready = readys[2];
        console.log('结束ETF数据完整性校验');
      });
    }
  }

  async checkEtfBasicReady(): Promise<boolean> {
    const etf_basic_ready = false; // 非行情数据无须存储
    await this.cacheManager.set(
      CACHE_KEY_ETF_DATA_SYNC.ETF_BASIC_READY,
      etf_basic_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return etf_basic_ready;
  }

  async fillFundAdjDataByTradeDates(tradeDates: string[]): Promise<void> {
    const fundAdjs = [];
    const tradeCal = await this.baseData.getTradeCal();
    const pArr = [];
    for (let j = 0; j < tradeDates.length; j++) {
      const trade_date = tradeDates[j];
      if (tradeCal[trade_date].is_open === 1) {
        pArr.push(
          getFundAdj(this.token, {
            trade_date,
          }).catch((e) => {
            console.log(`fundAdj数据抓取错误，请检查日期${trade_date}`);
          }),
        );
      }
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        fundAdjs.push(...val);
      });
    });
    for (let i = 0; i < fundAdjs.length; i += 1000) {
      const tempArr = fundAdjs.slice(i, i + 1000);
      await this.fundAdjRepository.save(tempArr);
    }
  }

  async fillFundAdjData(startDate: string, endDate: string): Promise<void> {
    const datesSpliceByYear = spliceByYear(startDate, endDate);
    const years = Object.keys(datesSpliceByYear);
    for (let i = 0; i < years.length; i++) {
      const tradeDates = datesSpliceByYear[years[i]];
      await this.fillFundAdjDataByTradeDates(tradeDates);
    }
  }

  async fillFundDailyDataByTradesDates(tradeDates: string[]): Promise<void> {
    const fundDailys = [];
    const tradeCal = await this.baseData.getTradeCal();
    const pArr = [];
    for (let j = 0; j < tradeDates.length; j++) {
      const trade_date = tradeDates[j];
      if (tradeCal[trade_date].is_open === 1) {
        pArr.push(
          getFundDaily(this.token, {
            trade_date,
          }).catch((e) => {
            console.log(`fundDaily数据抓取错误，请检查日期${trade_date}`);
          }),
        );
      }
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        fundDailys.push(...val);
      });
    });
    for (let i = 0; i < fundDailys.length; i += 1000) {
      const tempArr = fundDailys.slice(i, i + 1000);
      await this.fundDailyRepository.save(tempArr);
    }
  }

  async fillFundDailyData(startDate: string, endDate: string): Promise<void> {
    const datesSpliceByYear = spliceByYear(startDate, endDate);
    const years = Object.keys(datesSpliceByYear);
    for (let i = 0; i < years.length; i++) {
      const tradeDates = datesSpliceByYear[years[i]];
      await this.fillFundDailyDataByTradesDates(tradeDates);
    }
  }

  async checkEtfAdjReady(): Promise<boolean> {
    let etf_adj_ready = false;
    const needStartDate = (
      await this.baseDataUtil.utilGetAfterTradeDates(this.tradeCalBegin, 1)
    )[0];
    const needEndDate = (
      await this.baseDataUtil.utilGetBeforeTradeDates(getNowDate(), 1)
    )[0];
    // 数据库中数据的时间范围判断: [最小值, 最大值]
    const { startDate, endDate } = (
      await this.fundAdjRepository.query(
        `select min(trade_date) as startDate, max(trade_date) as endDate from fund_adj;`,
      )
    )[0];
    // case1：数据库没有数据
    if (!(startDate && endDate)) {
      console.log(
        `fund_adj数据填充开始，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
      );
      this.fillFundAdjData(needStartDate, needEndDate).then(() => {
        console.log(
          `fund_adj数据填充结束，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      });
    } else if (startDate > needStartDate || endDate < needEndDate) {
      //case2：数据库中数据不全
      if (startDate > needStartDate) {
        console.log(
          `fund_adj数据补充开始，开始日期: ${needStartDate}，结束日期: ${subDay(
            startDate,
          )}`,
        );
        this.fillFundAdjData(needStartDate, subDay(startDate)).then(() => {
          console.log(
            `fund_adj数据补充结束，开始日期: ${needStartDate}，结束日期: ${subDay(
              startDate,
            )}`,
          );
        });
      }
      if (endDate < needEndDate) {
        console.log(
          `fund_adj数据补充开始，开始日期: ${addDay(
            endDate,
          )}，结束日期: ${needEndDate}`,
        );
        this.fillFundAdjData(addDay(endDate), needEndDate).then(() => {
          console.log(
            `fund_adj数据补充结束，开始日期: ${addDay(
              endDate,
            )}，结束日期: ${needEndDate}`,
          );
        });
      }
    } else {
      //case3：数据库中数据完整（更严格时这里需要再判断每个交易日是否存在，才能判断完整）
      const need_trade_dates =
        await this.baseDataUtil.utilGetTradeDatesByRangeDate(
          needStartDate,
          needEndDate,
        );
      const db_trade_dates = (
        await this.fundAdjRepository.query(
          `SELECT DISTINCT(trade_date) FROM fund_adj WHERE trade_date BETWEEN '${needStartDate}' AND '${needEndDate}';`,
        )
      ).map((obj) => {
        return obj.trade_date;
      });
      const diff_trade_dates = need_trade_dates.filter((trade_date) => {
        return !db_trade_dates.includes(trade_date);
      });
      if (diff_trade_dates.length !== 0) {
        console.log(
          `fund_adj数据补充开始，日期枚举: ${diff_trade_dates.join(',')}`,
        );
        this.fillFundAdjDataByTradeDates(diff_trade_dates).then(() => {
          console.log(
            `fund_adj数据补充结束，日期枚举: ${diff_trade_dates.join(',')}`,
          );
        });
      } else {
        etf_adj_ready = true;
        console.log(
          `fund_adj数据校验完整，交易日总数：${db_trade_dates.length}，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      }
    }
    await this.cacheManager.set(
      CACHE_KEY_ETF_DATA_SYNC.ETF_ADJ_READY,
      etf_adj_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return etf_adj_ready;
  }

  async checkEtfDailyReady(): Promise<boolean> {
    let etf_daily_ready = false;
    const needStartDate = (
      await this.baseDataUtil.utilGetAfterTradeDates(this.tradeCalBegin, 1)
    )[0];

    const needEndDate = (
      await this.baseDataUtil.utilGetBeforeTradeDates(
        isTradeDayAfterHour(new Date(), 17)
          ? addDay(getNowDate())
          : getNowDate(),
        1,
      )
    )[0];
    // 数据库中数据的时间范围判断: [最小值, 最大值]
    const { startDate, endDate } = (
      await this.fundDailyRepository.query(
        `select min(trade_date) as startDate, max(trade_date) as endDate from fund_daily;`,
      )
    )[0];
    // case1：数据库没有数据
    if (!(startDate && endDate)) {
      console.log(
        `fund_daily数据填充开始，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
      );
      this.fillFundDailyData(needStartDate, needEndDate).then(() => {
        console.log(
          `fund_daily数据填充结束，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      });
    } else if (startDate > needStartDate || endDate < needEndDate) {
      //case2：数据库中数据不全
      if (startDate > needStartDate) {
        console.log(
          `fund_daily数据补充开始，开始日期: ${needStartDate}，结束日期: ${subDay(
            startDate,
          )}`,
        );
        this.fillFundDailyData(needStartDate, subDay(startDate)).then(() => {
          console.log(
            `fund_daily数据补充结束，开始日期: ${needStartDate}，结束日期: ${subDay(
              startDate,
            )}`,
          );
        });
      }
      if (endDate < needEndDate) {
        console.log(
          `fund_daily数据补充开始，开始日期: ${addDay(
            endDate,
          )}，结束日期: ${needEndDate}`,
        );
        this.fillFundDailyData(addDay(endDate), needEndDate).then(() => {
          console.log(
            `fund_daily数据补充结束，开始日期: ${addDay(
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
        await this.fundDailyRepository.query(
          `SELECT DISTINCT(trade_date) FROM fund_daily WHERE trade_date BETWEEN '${needStartDate}' AND '${needEndDate}';`,
        )
      ).map((obj) => {
        return obj.trade_date;
      });
      const diff_trade_dates = need_trade_dates.filter((trade_date) => {
        return !db_trade_dates.includes(trade_date);
      });
      if (diff_trade_dates.length !== 0) {
        console.log(
          `fund_daily数据补充开始，日期枚举: ${diff_trade_dates.join(',')}`,
        );
        this.fillFundDailyDataByTradesDates(diff_trade_dates).then(() => {
          console.log(
            `fund_daily数据补充结束，日期枚举: ${diff_trade_dates.join(',')}`,
          );
        });
      } else {
        etf_daily_ready = true;
        console.log(
          `fund_daily数据校验完整，交易日总数：${db_trade_dates.length}，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      }
    }
    await this.cacheManager.set(
      CACHE_KEY_ETF_DATA_SYNC.ETF_DAILY_READY,
      etf_daily_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return etf_daily_ready;
  }
}
