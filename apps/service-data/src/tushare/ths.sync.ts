import ThsDaily from '@/tushare/index/ths_daily.entity';
import ThsIndex from '@/tushare/index/ths_index.entity';
import ThsMember from '@/tushare/index/ths_member.entity';
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
import BaseData from './base.data';
import BaseDataUtil from './base.util';
import { addDay, getNowDate, spliceByYear, subDay } from '@/utils/date';
import { getThsMember } from '@/tushare/index/ths_member';
import ThsData from './ths.data';
import { getThsDaily } from '@/tushare/index/ths_daily';
import { getThsIndex } from '@/tushare/index/ths_index';
import { isTradeDayAfterHour } from '@/utils/time';

export const CACHE_KEY_THS_DATA_SYNC = {
  THS_INDEX_READY: 'ths_index_ready',
  THS_MEMBER_READY: 'ths_member_ready',
  THS_DAILY_READY: 'ths_daily_ready',
};
// 同步Tuhsare数据到数据库中
@Injectable()
export class ThsDataSync implements OnModuleInit {
  useMyDb: boolean;
  token: string;
  tradeCalBegin: string;
  constructor(
    @InjectRepository(ThsIndex)
    private thsIndexRepository: Repository<ThsIndex>,
    @InjectRepository(ThsMember)
    private thsMemberRepository: Repository<ThsMember>,
    @InjectRepository(ThsDaily)
    private thsDailyRepository: Repository<ThsDaily>,
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
      let ths_index_ready, ths_member_ready, ths_daily_ready;
      const pArr = [
        this.checkThsIndexReady(),
        this.checkThsMemberReady(),
        this.checkThsDailyReady(),
      ];
      await Promise.all(pArr).then((readys) => {
        ths_index_ready = readys[0];
        ths_member_ready = readys[1];
        ths_daily_ready = readys[2];
        console.log('结束板块数据完整性校验');
      });
    }
  }

  async checkThsIndexReady(): Promise<boolean> {
    const ths_index_ready = false;
    await this.cacheManager.set(
      CACHE_KEY_THS_DATA_SYNC.THS_INDEX_READY,
      ths_index_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return ths_index_ready;
  }

  async fillThsMemberDataByThsCodes(curThsCodes: string[]): Promise<void> {
    const thsMembers = [];
    const pArr = [];
    for (let j = 0; j < curThsCodes.length; j++) {
      const ths_code = curThsCodes[j];
      pArr.push(
        getThsMember(this.token, {
          ts_code: ths_code,
        }).catch((e) => {
          console.log(`ths_member数据抓取错误，请检查代码${ths_code}`);
        }),
      );
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        thsMembers.push(...val);
      });
    });
    for (let i = 0; i < thsMembers.length; i += 1000) {
      const tempArr = thsMembers.slice(i, i + 1000);
      await this.thsMemberRepository.save(tempArr);
    }
  }

  async fillThsMemberData(thsCodes: string[]): Promise<void> {
    for (let i = 0; i < thsCodes.length; i += 300) {
      const curThsCodes = thsCodes.slice(i, i + 300);
      await this.fillThsMemberDataByThsCodes(curThsCodes);
    }
  }

  async checkThsMemberReady(): Promise<boolean> {
    return false;
    let ths_member_ready = false;
    const excludeCodes = ['884253.TI', '884259.TI']; // 没有成分股的板块
    const all_ths_codes = (
      await getThsIndex(
        this.token,
        {
          exchange: 'A',
          type: 'I',
        },
        ['ts_code'],
      )
    )
      .map((obj) => {
        return obj.ts_code;
      })
      .filter((ths_code) => {
        return !excludeCodes.includes(ths_code);
      });
    const db_ths_codes = (
      await this.thsMemberRepository.query(
        `SELECT DISTINCT(ts_code) FROM ths_member;`,
      )
    ).map((obj) => {
      return obj.ts_code;
    });
    const diff_ths_codes = all_ths_codes.filter((ths_code) => {
      return !db_ths_codes.includes(ths_code);
    });
    if (diff_ths_codes.length > 0) {
      this.fillThsMemberData(diff_ths_codes).then(() => {
        console.log(
          `ths_member数据补充结束，板块代码枚举：${diff_ths_codes.join(',')}`,
        );
      });
    } else {
      console.log(`ths_member数据校验完整，板块总数：${db_ths_codes.length}`);
      ths_member_ready = true;
    }
    await this.cacheManager.set(
      CACHE_KEY_THS_DATA_SYNC.THS_MEMBER_READY,
      ths_member_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return ths_member_ready;
  }

  async fillThsDailyDataByTradesDates(tradeDates: string[]): Promise<void> {
    const thsDailys = [];
    const tradeCal = await this.baseData.getTradeCal();
    const pArr = [];
    for (let j = 0; j < tradeDates.length; j++) {
      const trade_date = tradeDates[j];
      if (tradeCal[trade_date].is_open === 1) {
        pArr.push(
          getThsDaily(this.token, {
            trade_date,
          }).catch((e) => {
            console.log(`thsDaily数据抓取错误，请检查日期${trade_date}`);
          }),
        );
      }
    }
    await Promise.all(pArr).then((values) => {
      values.forEach((val) => {
        if (!val) {
          return;
        }
        thsDailys.push(...val);
      });
    });
    for (let i = 0; i < thsDailys.length; i += 1000) {
      const tempArr = thsDailys.slice(i, i + 1000);
      await this.thsDailyRepository.save(tempArr);
    }
  }

  async fillThsDailyData(startDate: string, endDate: string): Promise<void> {
    const datesSpliceByYear = spliceByYear(startDate, endDate);
    const years = Object.keys(datesSpliceByYear);
    for (let i = 0; i < years.length; i++) {
      const tradeDates = datesSpliceByYear[years[i]];
      await this.fillThsDailyDataByTradesDates(tradeDates);
    }
  }

  async checkThsDailyReady(): Promise<boolean> {
    return false;
    let ths_daily_ready = false;
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
    const { startDate, endDate } = (
      await this.thsDailyRepository.query(
        `select min(trade_date) as startDate, max(trade_date) as endDate from ths_daily;`,
      )
    )[0];
    // case1：数据库没有数据
    if (!(startDate && endDate)) {
      console.log(
        `ths_daily数据填充开始，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
      );
      this.fillThsDailyData(needStartDate, needEndDate).then(() => {
        console.log(
          `ths_daily数据填充结束，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      });
    } else if (startDate > needStartDate || endDate < needEndDate) {
      //case2：数据库中数据不全
      if (startDate > needStartDate) {
        console.log(
          `ths_daily数据补充开始，开始日期: ${needStartDate}，结束日期: ${subDay(
            startDate,
          )}`,
        );
        this.fillThsDailyData(needStartDate, subDay(startDate)).then(() => {
          console.log(
            `ths_daily数据补充结束，开始日期: ${needStartDate}，结束日期: ${subDay(
              startDate,
            )}`,
          );
        });
      }
      if (endDate < needEndDate) {
        console.log(
          `ths_daily数据补充开始，开始日期: ${addDay(
            endDate,
          )}，结束日期: ${needEndDate}`,
        );
        this.fillThsDailyData(addDay(endDate), needEndDate).then(() => {
          console.log(
            `ths_daily数据补充结束，开始日期: ${addDay(
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
        await this.thsDailyRepository.query(
          `SELECT DISTINCT(trade_date) FROM ths_daily WHERE trade_date BETWEEN '${needStartDate}' AND '${needEndDate}';`,
        )
      ).map((obj) => {
        return obj.trade_date;
      });
      const diff_trade_dates = need_trade_dates.filter((trade_date) => {
        return !db_trade_dates.includes(trade_date);
      });
      if (diff_trade_dates.length !== 0) {
        console.log(
          `ths_daily数据补充开始，日期枚举: ${diff_trade_dates.join(',')}`,
        );
        this.fillThsDailyDataByTradesDates(diff_trade_dates).then(() => {
          console.log(
            `ths_daily数据补充结束，日期枚举: ${diff_trade_dates.join(',')}`,
          );
        });
      } else {
        ths_daily_ready = true;
        console.log(
          `ths_daily数据校验完整，交易日总数：${db_trade_dates.length}，开始日期: ${needStartDate}，结束日期: ${needEndDate}`,
        );
      }
    }
    await this.cacheManager.set(
      CACHE_KEY_THS_DATA_SYNC.THS_DAILY_READY,
      ths_daily_ready,
      {
        ttl: 24 * 60 * 60,
      },
    );
    return ths_daily_ready;
  }
}
