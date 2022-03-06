import TushareData from '@/service-core/src/tushare.data';
import { getNowDate } from '@/utils/date';
import { Inject, Injectable } from '@nestjs/common';
import { EmailCli } from './provider/email';

export type StockBackTestNotifyType = {
  [ts_code: string]: number;
};

export type StockSelectNotifyType = string[];

@Injectable()
export class NotifyService {
  constructor(
    @Inject(EmailCli) private readonly emailCli: EmailCli,
    public readonly tushareData: TushareData,
  ) {}

  sendEmialTest(data: any): void {
    this.emailCli.sendHtmlToSelf(data, `Hello ${data}!`);
  }

  async stock_backTest(backTest: StockBackTestNotifyType): Promise<void> {
    const stockBasic = await this.tushareData.getStockBasic();
    const profitRows = Object.keys(backTest).map((ts_code: string) => {
      return `<tr><td>${stockBasic[ts_code].name}</td><td>${ts_code}</td><td>${backTest[ts_code]}</td></tr>`;
    });
    const profitHtml = `
      <h1>昨日回测：</h1>
      <table border="1" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th width="34%">
          股票名称
          </th>
          <th width="33%">
          股票代码
          </th>
          <th width="33%">
          回测获利
          </th>
        </tr>
      </thead>
      <tbody>
        ${profitRows.join('')}
      <tbody>
    </table>`;
    this.emailCli.sendHtmlToSelf(
      `收益回测(昨买今卖)：${getNowDate()}`,
      `${profitHtml}`,
    );
  }

  async stock_select(ts_codes: StockSelectNotifyType): Promise<void> {
    // TODO 收益改成了一个数组
    const stockBasic = await this.tushareData.getStockBasic();
    const adviseRows = ts_codes.map((ts_code: string) => {
      return `<tr><td>${stockBasic[ts_code].name}</td><td>${ts_code}</td></tr>`;
    });
    const adviseHtml = `
      <h1>明日推荐：</h1>
      <table border="1" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th width="50%">
          股票名称
          </th>
          <th width="50%">
          股票代码
          </th>
        </tr>
      </thead>
      <tbody>
        ${adviseRows.join('')}
      <tbody>
    </table>`;
    this.emailCli.sendHtmlToSelf(`明日荐股：${getNowDate()}`, `${adviseHtml}`);
  }
}
