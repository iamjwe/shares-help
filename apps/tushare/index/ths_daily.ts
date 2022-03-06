import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：ths_daily
描述：获取同花顺板块指数行情。注：数据版权归属同花顺，如做商业用途，请主动联系同花顺，如需帮助请联系微信migedata 。
限量：单次最大3000行数据（5000积分），可根据指数代码、日期参数循环提取。
*/
const api_name = 'ths_daily';
export type ThsDailyParams = {
  ts_code?: string; // 指数代码
  trade_date?: string; // 交易日期（YYYYMMDD格式，下同）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type ThsDailyResult = {
  ts_code?: string; // TS指数代码
  trade_date?: string; // 交易日
  close?: number; // 收盘点位
  open?: number; // 开盘点位
  high?: number; // 最高点位
  low?: number; // 最低点位
  pre_close?: number; // 昨日收盘点
  avg_price?: number; // 平均价
  change?: number; // 涨跌点位
  pct_change?: number; // 涨跌幅
  vol?: number; // 成交量
  turnover_rate?: number; // 换手率
  total_mv?: number; // 总市值
  float_mv?: number; // 流通市值
};
export type ThsDailyField =
  | 'ts_code'
  | 'trade_date'
  | 'close'
  | 'open'
  | 'high'
  | 'low'
  | 'pre_close'
  | 'avg_price'
  | 'change'
  | 'pct_change'
  | 'vol'
  | 'turnover_rate'
  | 'total_mv'
  | 'float_mv';

export const getThsDaily = async (
  token: string,
  params?: ThsDailyParams,
  fields?: ThsDailyField[] | string,
): Promise<ThsDailyResult[]> | null => {
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
  const data = await getThsDaily(tushare_token, {
    ts_code: '885964.TI',
  });
  console.log(data);
}

// test();
