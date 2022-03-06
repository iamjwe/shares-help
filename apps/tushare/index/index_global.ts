import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_global
描述：获取国际主要指数日线行情
限量：单次最大提取4000行情数据，可循环获取，总量不限制
*/
const api_name = 'index_global';
export type IndexGlobalParams = {
  ts_code?: string; // TS指数代码，见下表
  trade_date?: string; // 交易日期，YYYYMMDD格式，下同
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type IndexGlobalResult = {
  ts_code?: string; // TS指数代码
  trade_date?: string; // 交易日
  open?: number; // 开盘点位
  close?: number; // 收盘点位
  high?: number; // 最高点位
  low?: number; // 最低点位
  pre_close?: number; // 昨日收盘点
  change?: number; // 涨跌点位
  pct_chg?: number; // 涨跌幅
  swing?: number; // 振幅
  vol?: number; // 成交量 （大部分无此项数据）
  amount?: number; // 成交额 （大部分无此项数据）
};
export type IndexGlobalField =
  | 'ts_code'
  | 'trade_date'
  | 'open'
  | 'close'
  | 'high'
  | 'low'
  | 'pre_close'
  | 'change'
  | 'pct_chg'
  | 'swing'
  | 'vol'
  | 'amount';

export const getIndexGlobal = async (
  token: string,
  params?: IndexGlobalParams,
  fields?: IndexGlobalField[] | string,
): Promise<IndexGlobalResult[]> | null => {
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
  const data = await getIndexGlobal(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
