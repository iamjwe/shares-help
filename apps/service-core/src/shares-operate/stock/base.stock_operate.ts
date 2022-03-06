import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import TushareData from '../../tushare.data';
import { BuyInfo, HoldInfo, OperateInfo, SellInfo } from './type.stock_operate';

/* 
  三部分抽象：
    1.getBuyInfo：计算买入日期和价格
    2.getSellInfo：计算卖出日期和价格
    3.getHoldInfo：计算持有日期以及收益
*/

@Injectable()
export default abstract class BaseStockOperate {
  protected buyInfo: BuyInfo;
  protected sellInfo: SellInfo;
  protected holdInfo: HoldInfo;
  protected operateInfo: OperateInfo;

  constructor(
    public readonly tushareData: TushareData,
    public readonly notifyClient: ClientProxy,
  ) {}

  protected abstract getBuyInfo(
    ts_codes: string[],
    date: string,
  ): Promise<BuyInfo>;

  protected abstract getSellInfo(buyInfo: BuyInfo): Promise<SellInfo>;

  protected abstract getHoldInfo(
    buyInfo: BuyInfo,
    sellInfo: SellInfo,
  ): Promise<HoldInfo>;

  protected calCulateHoldProfit(
    buyPrice: number,
    sellPrice: number | null,
  ): number | null {
    if (sellPrice === null) {
      return null;
    }
    return Number((((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2));
  }

  // start_core模拟操作所选股票，controller不会直接调用
  public async start_core(
    ts_codes: string[],
    date: string,
  ): Promise<OperateInfo> {
    const buyInfo = await this.getBuyInfo(ts_codes, date);
    const sellInfo = await this.getSellInfo(buyInfo);
    const holdInfo = await this.getHoldInfo(buyInfo, sellInfo);
    return {
      buyInfo,
      sellInfo,
      holdInfo,
    };
  }

  // start模拟操作所选股票并计算收益后console，controller会直接调用
  public async start(ts_codes: string[], date: string): Promise<OperateInfo> {
    // 过滤ts_codes中输入错误的元素
    const allStockCodes = await this.tushareData.getStockCodes();
    const error_codes = [];
    ts_codes = ts_codes.filter((ts_code) => {
      const flag = allStockCodes.indexOf(ts_code) !== -1;
      if (!flag) {
        error_codes.push(ts_code);
      }
      return flag;
    });
    if (error_codes.length > 0) {
      console.log(`不存在的标的代码：${error_codes.join(',')}`);
    }
    const buyInfo = await this.getBuyInfo(ts_codes, date);
    const sellInfo = await this.getSellInfo(buyInfo);
    const holdInfo = await this.getHoldInfo(buyInfo, sellInfo);
    ts_codes = Object.keys(buyInfo);
    const concoleArr = ts_codes.map((ts_code) => {
      return `标的：${ts_code}，买入日期：${buyInfo[ts_code].buyDate},，卖出日期：${sellInfo[ts_code].sellDate}，持有收益：${holdInfo[ts_code].holdProfit}`;
    });
    console.log(concoleArr.join('\n'));
    return {
      buyInfo,
      sellInfo,
      holdInfo,
    };
  }
}
