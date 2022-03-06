import { ThsDailyResult } from '@/tushare/index/ths_daily';
import { calAvag } from '@/utils/number';
import { Injectable } from '@nestjs/common';
import TushareData from '../../tushare.data';
import SharesSelectUtil from '../shares_select.util';
import { ths_concept, ths_industry } from './ths.const';

/*
 */

@Injectable()
export default class LimitThsSelect {
  constructor(
    public readonly tushareData: TushareData,
    public readonly analysisUtil: SharesSelectUtil,
  ) {}

  async start(date): Promise<string[]> {
    const poolCodes = await this.getSharesPool(date);
    const thsCodes = await this.thsFilter(poolCodes, date);
    return thsCodes;
  }

  async start_core(date): Promise<string[]> {
    const poolCodes = await this.getSharesPool(date);
    const thsCodes = await this.thsFilter(poolCodes, date);
    return thsCodes;
  }

  async getSharesPool(date: string): Promise<string[]> {
    const aths_codes = ths_industry.concat(ths_concept);
    return aths_codes;
  }

  async thsFilter(ths_codes: string[], date: string): Promise<string[]> {
    const thsMapArr = [];
    const thsArr = [];
    // 获取所有板块近一段时间的行情
    const trade_dates = await this.analysisUtil.utilGetBeforeTradeDates(
      date,
      10,
    );
    const pArr = [];
    for (let i = 0; i < ths_codes.length; i++) {
      const ts_code = ths_codes[i];
      pArr.push(this.tushareData.getThsDaily(ts_code));
    }
    await Promise.all(pArr).then((values) => {
      values.forEach(
        (data: {
          thsDaily: {
            [trade_date: string]: ThsDailyResult;
          };
          lastThsDaily: ThsDailyResult;
        }) => {
          if (!data) {
            return;
          }
          const { thsDaily, lastThsDaily } = data;
          if (!(thsDaily && lastThsDaily)) {
            return;
          }
          const { ts_code: ths_code } = lastThsDaily;
          const amountArr = [];
          const priceArr = [];
          const pctChgs = [];
          const openArr = [];
          for (let i = 0; i < trade_dates.length; i++) {
            const curThsDaily = thsDaily[trade_dates[i]];
            if (!curThsDaily) {
              continue;
            }
            const { close, pct_change, vol, open } = curThsDaily;
            openArr.push(open);
            priceArr.push(close);
            pctChgs.push(pct_change);
            amountArr.push(vol);
          }
          //
          if (
            pctChgs[0] > 3 && // 形成板块情绪
            true
          ) {
            thsMapArr.push({ code: ths_code, pctChg: pctChgs[0] });
          }
        },
      );
    });
    // 龙头板块（涨幅第一的板块）
    const theFirstPctChgThs = thsMapArr.sort((a, b) => {
      return b.pctChg - a.pctChg;
    })[0];
    if (theFirstPctChgThs) {
      const dragonCode = theFirstPctChgThs.code;
      thsArr.push(dragonCode);
      const thsBasics = await this.tushareData.getThsBasics();
      console.log(
        `日期: ${date}，选出龙头板块：${theFirstPctChgThs.code}, 板块名称：${thsBasics[dragonCode].name}`,
      );
    } else {
      console.log(`日期: ${date}，该日未有龙头板块出现`);
    }
    return thsArr;
  }
}
