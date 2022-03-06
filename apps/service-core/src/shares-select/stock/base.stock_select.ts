import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import TushareData from '../../tushare.data';
import SharesSelectUtil from '../shares_select.util';
import { ThsMemberResult } from '@/tushare/index/ths_member';
import { curHotThsDirection } from '../ths/ths.static';

/* 
  两部分抽象：
    1.getStockPool：子类实现股票池
    2.getStockFilters: 子类实现股票过滤器
*/

@Injectable()
export default abstract class BaseStockSelect {
  protected stockPoolCodes: string[];
  protected stockFilters: ((
    codes: string[],
    date: string,
  ) => Promise<string[]>)[];
  protected stockCodes: string[];
  protected stockThsMap?: { [ts_code: string]: string[] };
  protected thsCodes?: string[];

  constructor(
    public readonly tushareData: TushareData,
    public readonly sharesSelectUtil: SharesSelectUtil,
    public readonly notifyClient: ClientProxy,
  ) {
    this.stockPoolCodes = [];
    this.stockFilters = [];
    this.stockCodes = [];
  }

  protected abstract getStockPool(date: string): Promise<string[]>;

  protected abstract getStockFilters(): ((
    codes: string[],
    date: string,
  ) => Promise<string[]>)[];

  public async getStockCodes(date: string): Promise<string[]> {
    const stockCodes = await this.start_core(date);
    return stockCodes;
  }

  // start_core选股后不console，controller不会直接调用
  public async start_core(date: string): Promise<string[]> {
    const poolCodes = await this.getStockPool(date);
    const stockFilters = await this.getStockFilters();
    let stockCodes = poolCodes;
    for (let i = 0; i < stockFilters.length; i++) {
      const fn = stockFilters[i];
      stockCodes = await fn(stockCodes, date);
    }
    return stockCodes;
  }

  // start选股后console，controller会直接调用
  public async start(date: string): Promise<string[]> {
    const poolCodes = await this.getStockPool(date);
    const stockFilters = await this.getStockFilters();
    let stockCodes = poolCodes;
    for (let i = 0; i < stockFilters.length; i++) {
      const fn = stockFilters[i];
      stockCodes = await fn(stockCodes, date);
    }
    const stockBasics = await this.tushareData.getStockBasic();
    // case 1：有板块输出板块（自上而下选股）
    if (this.thsCodes?.length > 0) {
      stockCodes.sort((a: string, b: string) => {
        return this.stockThsMap[a].length - this.stockThsMap[b].length;
      });
      console.log(
        `股票分析结束，日期: ${date}，${`共选出板块${this.thsCodes.length} + ${curHotThsDirection.length}个，`}股票${
          stockCodes.length
        }个，枚举如下: `,
      );
      stockCodes.forEach((ts_code) => {
        console.log(
          `       股票代码：${ts_code}, 股票名称：${
            stockBasics[ts_code].name
          }${`, 所属板块：${Array.from(new Set(this.stockThsMap[ts_code])).join(
            ',',
          )}`}`,
        );
      });
    } else {
      // case2：无板块不输出板块
      stockCodes.sort((a: string, b: string) => {
        return this.stockThsMap[a].length - this.stockThsMap[b].length;
      });
      console.log(
        `股票分析结束，日期: ${date}，股票${stockCodes.length}个，枚举如下: `,
      );
      stockCodes.forEach((ts_code) => {
        console.log(
          `       股票代码：${ts_code}, 股票名称：${stockBasics[ts_code].name}`,
        );
      });
    }
    this.stockCodes = stockCodes;
    return stockCodes;
  }

  // 自上而下选股，先选板块再选个股
  protected async getThsStockCodes(thsArr: string[]): Promise<string[]> {
    const stockCodes = [];
    const thsBasics = await this.tushareData.getThsBasics();
    for (let i = 0; i < thsArr.length; i++) {
      const ths_code = thsArr[i];
      const stockMembers: ThsMemberResult[] =
        await this.tushareData.getThsMembers(ths_code);
      if (!stockMembers) {
        continue;
      }
      const ts_codes = stockMembers.map((memberResult) => {
        return memberResult.code;
      });
      ts_codes.forEach((ts_code) => {
        if (!this.stockThsMap[ts_code]) {
          this.stockThsMap[ts_code] = [];
        }
        this.stockThsMap[ts_code].push(
          thsBasics[ths_code] ? thsBasics[ths_code].name : ths_code,
        );
      });
      stockCodes.push(...ts_codes);
    }
    return Array.from(new Set(stockCodes));
  }
}
