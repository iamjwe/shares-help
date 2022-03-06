import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_weekly
描述：获取指数周线行情
*/
const api_name = 'index_weekly';
export type IndexWeeklyParams = {
  ts_code?: string; // TS代码
  trade_date?: string; // 交易日期
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type IndexWeeklyResult = {
  ts_code?: string; // TS指数代码
  trade_date?: string; // 交易日
  close?: number; // 收盘点位
  open?: number; // 开盘点位
  high?: number; // 最高点位
  low?: number; // 最低点位
  pre_close?: number; // 昨日收盘点
  change?: number; // 涨跌点位
  pct_chg?: number; // 涨跌幅
  vol?: number; // 成交量
  amount?: number; // 成交额
};
export type IndexWeeklyField =
  | 'ts_code'
  | 'trade_date'
  | 'close'
  | 'open'
  | 'high'
  | 'low'
  | 'pre_close'
  | 'change'
  | 'pct_chg'
  | 'vol'
  | 'amount';

export const getIndexWeekly = async (
  token: string,
  params?: IndexWeeklyParams,
  fields?: IndexWeeklyField[] | string,
): Promise<IndexWeeklyResult[]> | null => {
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
      console.log('reqBody', reqBody);
      console.log(error);
      result = null;
    });
  return result;
};

async function test() {
  const data = await getIndexWeekly(tushare_token, {
    ts_code: '399300.SZ',
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
