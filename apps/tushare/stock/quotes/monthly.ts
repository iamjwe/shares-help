import axios from 'axios';
import { tushare_token } from '../../tushare.config';
import { getAdjFactor } from './adj_factor';
// 接口：monthly
// 描述：获取A股周线行情
// 限量：单次最大4500行，总量不限制
const api_name = 'monthly';

export type MonthlyParams = {
  ts_code?: string; // 	股票代码（支持多个股票同时提取，逗号分隔）
  trade_date?: string; // 交易日期 （每周最后一个交易日期，YYYYMMDD格式）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type MonthlyResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 交易日期
  close?: number; // 	月收盘价
  open?: number; // 月开盘价
  high?: number; // 月最高价
  low?: number; // 月最低价
  pre_close?: number; // 上月收盘价
  change?: number; // 月涨跌额
  pct_chg?: number; // 月涨跌幅 （未复权，如果是复权请用 通用行情接口 ）
  vol?: number; // 月成交量
  amount?: number; // 月成交额
};

export type MonthlyField =
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

export const getMonthly = async (
  token: string,
  params?: MonthlyParams,
  fields?: MonthlyField[] | string,
): Promise<MonthlyResult[]> | null => {
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
  const data = await getMonthly(tushare_token, {
    ts_code: '600132.SH',
    end_date: '20211026',
  });
  const adjs = await getAdjFactor(tushare_token, {
    ts_code: '600132.SH',
    end_date: '20211026',
  });
  const adjDateMap = {};
  adjs.forEach((adj) => {
    adjDateMap[adj.trade_date] = adj;
  });
  // 最新复权因子
  const lastAdj = adjs[0];
  // 获取该日复权因子
  const newData = data.map((month) => {
    const trade_date = month.trade_date;
    // 查询当日复权因子
    const curAdj = adjDateMap[trade_date];
    if (!curAdj) {
      return month;
    }
    month.close = (month.close * curAdj.adj_factor) / lastAdj.adj_factor;
    month.open = (month.open * curAdj.adj_factor) / lastAdj.adj_factor;
    month.high = (month.high * curAdj.adj_factor) / lastAdj.adj_factor;
    month.low = (month.low * curAdj.adj_factor) / lastAdj.adj_factor;
    return month;
  });
  const dataDateMap = {};
  data.forEach((item) => {
    dataDateMap[item.trade_date] = item;
  });
  const newDataDateMap = {};
  newData.forEach((item) => {
    newDataDateMap[item.trade_date] = item;
  });
  console.log(
    dataDateMap['20200430'],
    newDataDateMap['20200430'],
    adjDateMap['20200430'],
    lastAdj,
  );
}

// test();
