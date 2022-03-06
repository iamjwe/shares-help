import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_daily，可以通过数据工具调试和查看数据。
描述：获取指数每日行情，还可以通过bar接口获取。
由于服务器压力，目前规则是单次调取最多取8000行记录，可以设置start和end日期补全。
指数行情也可以通过通用行情接口获取数据．
*/
const api_name = 'index_daily';
export type IndexDailyParams = {
  ts_code: string; // 指数代码
  trade_date?: string; // 交易日期 （日期格式：YYYYMMDD，下同）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type IndexDailyResult = {
  ts_code?: string; // TS指数代码
  trade_date?: string; // 交易日
  close?: number; // 收盘点位
  open?: number; // 开盘点位
  high?: number; // 最高点位
  low?: number; // 最低点位
  pre_close?: number; // 昨日收盘点
  change?: number; // 涨跌点
  pct_chg?: number; // 涨跌幅（%）
  vol?: number; // 成交量（手）
  amount?: number; // 成交额（千元）
};
export type IndexDailyField =
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

export const getIndexDaily = async (
  token: string,
  params?: IndexDailyParams,
  fields?: IndexDailyField[] | string,
): Promise<IndexDailyResult[]> | null => {
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
  const data = await getIndexDaily(tushare_token, {
    ts_code: '000001.SH',
  });
  console.log(data);
}

// test();
