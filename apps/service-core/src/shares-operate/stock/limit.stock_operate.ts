import Daily from '@/tushare/stock/quotes/daily.entity';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import TushareData from '../../tushare.data';
import SharesOperateUtil from '../shares_operate.util';
import BaseStockOperate from './base.stock_operate';
import { BuyInfo, SellInfo, HoldInfo } from './type.stock_operate';

/*
  追板操作：高趋势性的同时蕴藏巨大风险
    1.买入：均仓分布，以当日开盘价买入（现实操作：以涨停价挂隔夜单）
    2.卖出：与当日走势有关，断板次日开盘直接卖出，不断板看主观判断，模拟计算以当日最低价与当日最高价折中价卖出
 */

@Injectable()
export default class LimitStockOperate extends BaseStockOperate {
  constructor(
    public readonly tushareData: TushareData,
    public readonly sharesOperateUtil: SharesOperateUtil,
    @Inject('SERVICE_NOTIFY') public readonly notifyClient: ClientProxy,
  ) {
    super(tushareData, notifyClient);
  }

  protected async getBuyInfo(
    ts_codes: string[],
    date: string,
  ): Promise<BuyInfo> {
    const buyInfo: BuyInfo = {};
    const avagPercentage = (1 / ts_codes.length).toFixed(2);
    const trade_date = (
      await this.sharesOperateUtil.utilGetAfterTradeDates(date, 1)
    )[0];
    const pArr = [];
    for (let i = 0; i < ts_codes.length; i++) {
      const ts_code = ts_codes[i];
      pArr.push(await this.tushareData.getStockDaily(ts_code));
    }
    Promise.all(pArr).then((stockDailysArr) => {
      stockDailysArr.forEach((stockDailys) => {
        const { stockDaily } = stockDailys;
        if (!stockDaily[trade_date]) {
          // 没有开市
          return {};
        }
        const { open, ts_code, high, low, pre_close } = stockDaily[trade_date];
        if (high === low && open > pre_close) {
          // 一字涨停无法买入
          return {};
        }
        buyInfo[ts_code] = {
          buyDate: trade_date,
          buyPercentage: Number(avagPercentage),
          buyPrice: open,
        };
      });
    });
    return buyInfo;
  }

  protected async getSellInfo(buyInfo: BuyInfo): Promise<SellInfo> {
    const ts_codes = Object.keys(buyInfo);
    const sellInfo: SellInfo = {};
    for (let i = 0; i < ts_codes.length; i++) {
      const ts_code = ts_codes[i];
      const { stockDaily } = await this.tushareData.getStockDaily(ts_code);
      const buyDate = buyInfo[ts_code].buyDate;
      const sellDate = (
        await this.sharesOperateUtil.utilGetAfterTradeDates(buyDate, 2)
      )[1];
      const { pct_chg } = stockDaily[buyDate];
      if (!stockDaily[sellDate]) {
        // 当天还未开市或不开市
        sellInfo[ts_code] = { sellDate, sellPrice: null };
      } else {
        const {
          open: open_sell,
          low: low_sell,
          high: hign_sell,
        } = stockDaily[sellDate];
        if (pct_chg < 9.8) {
          // 断板了，开盘卖出
          sellInfo[ts_code] = { sellDate, sellPrice: open_sell };
        } else {
          // 未断板，主观判断是否卖出，程序模拟以最低价与最高价的1/2模拟
          sellInfo[ts_code] = {
            sellDate: sellDate,
            sellPrice: Number(((low_sell + hign_sell) / 2).toFixed(2)),
          };
        }
      }
    }
    return sellInfo;
  }

  protected async getHoldInfo(
    buyInfo: BuyInfo,
    sellInfo: SellInfo,
  ): Promise<HoldInfo> {
    const holdInfo: HoldInfo = {};
    const ts_codes = Object.keys(buyInfo);
    for (let i = 0; i < ts_codes.length; i++) {
      const ts_code = ts_codes[i];
      const buyDate = buyInfo[ts_code].buyDate;
      const sellDate = sellInfo[ts_code].sellDate;
      const holdDates = await this.sharesOperateUtil.utilSubTradeDates(
        buyDate,
        sellDate,
      );
      holdInfo[ts_code] = {
        holdDates,
        holdDaysNum: holdDates.length,
        holdProfit: this.calCulateHoldProfit(
          buyInfo[ts_code].buyPrice,
          sellInfo[ts_code].sellPrice,
        ),
      };
    }
    return holdInfo;
  }
}
