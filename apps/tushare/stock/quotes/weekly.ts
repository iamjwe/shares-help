import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：weekly
// 描述：获取A股周线行情
// 限量：单次最大4500行，总量不限制
const api_name = 'weekly';

export type WeeklyParams = {
  ts_code?: string; // 	股票代码（支持多个股票同时提取，逗号分隔）
  trade_date?: string; // 交易日期 （每周最后一个交易日期，YYYYMMDD格式）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type WeeklyResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 	交易日期
  close?: number; // 	周收盘价
  open?: number; // 周开盘价
  high?: number; // 周最高价
  low?: number; // 周最低价
  pre_close?: number; // 上一周收盘价
  change?: number; // 	周涨跌额
  pct_chg?: number; // 周涨跌幅 （未复权，如果是复权请用 通用行情接口 ）
  vol?: number; // 周成交量
  amount?: number; // 周成交额
};

export type WeeklyField =
  | 'ts_code'
  | 'trade_date'
  | 'close'
  | 'open	'
  | 'high'
  | 'low'
  | 'pre_close'
  | 'change'
  | 'pct_chg'
  | 'vol'
  | 'amount';

export const getWeekly = async (
  token: string,
  params?: WeeklyParams,
  fields?: WeeklyField[] | string,
): Promise<WeeklyResult[]> | null => {
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
  const data = await getWeekly(tushare_token, {
    ts_code: '600132.SH',
    start_date: '20211001',
  });
  console.log(data);
}

// test();
