import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
描述：获取场内基金日线行情，类似股票日行情
更新：每日收盘后2小时内
限量：单次最大800行记录，总量不限制
*/
const api_name = 'fund_daily';
export type FundDailyParams = {
  ts_code?: string; // 基金代码（二选一）
  trade_date?: string; // 交易日期（二选一）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type FundDailyResult = {
  ts_code?: string; // TS代码
  trade_date?: string; // 交易日期
  open?: number; // 开盘价(元)
  high?: number; // 最高价(元)
  low?: number; // 最低价(元)
  close?: number; // 收盘价(元)
  pre_close?: number; // 昨收盘价(元)
  change?: number; // 涨跌额(元)
  pct_chg?: number; // 涨跌幅(%)
  vol?: number; // 成交量(手)
  amount?: number; // 成交额(千元)
};
export type FundDailyField =
  | 'ts_code'
  | 'trade_date'
  | 'open'
  | 'high'
  | 'low'
  | 'close'
  | 'pre_close'
  | 'change'
  | 'pct_chg'
  | 'vol'
  | 'amount';

export const getFundDaily = async (
  token: string,
  params?: FundDailyParams,
  fields?: FundDailyField[] | string,
): Promise<FundDailyResult[]> | null => {
  let result = null;
  if (Array.isArray(fields)) {
    fields = fields.join(',');
  }
  const reqBody = {
    api_name,
    token,
    params: params ? params : {},
    fields: fields,
  };
  await axios
    .post('http://api.waditu.com', reqBody)
    .then((res) => {
      const { code, msg, data } = res.data;
      if (code !== 0) {
        console.log('reqError', msg, reqBody);
        result = null;
      }
      const { fields, items } = data;
      const mapResult = items.map((itemArr) => {
        const obj = {};
        for (let i = 0; i < itemArr.length; i++) {
          obj[fields[i]] = itemArr[i];
        }
        return obj;
      });
      result = mapResult;
    })
    .catch((error) => {
      console.log('request error, reqBody', reqBody);
      // console.log(error);
      result = null;
    });
  return result;
};

async function test() {
  const data = await getFundDaily(tushare_token, {
    ts_code: '516610.SH',
    start_date: '20211001',
  });
  console.log(data);
}

// test();
