import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：top_list
描述：龙虎榜每日交易明细
数据历史： 2005年至今
*/
const api_name = 'top_list';
export type TopListParams = {
  trade_date: string; // 交易日期
  ts_code?: string; // 股票代码
};
export type TopListResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // TS代码
  name?: string; // 名称
  close?: number; // 收盘价
  pct_change?: number; // 涨跌幅
  turnover_rate?: number; // 换手率
  amount?: number; // 总成交额
  l_sell?: number; // 龙虎榜卖出额
  l_buy?: number; // 龙虎榜买入额
  l_amount?: number; // 龙虎榜成交额
  net_amount?: number; // 龙虎榜净买入额
  net_rate?: number; // 龙虎榜净买额占比
  amount_rate?: number; // 龙虎榜成交额占比
  float_values?: number; // 当日流通市值
  reason?: string; // 上榜理由
};
export type TopListField =
  | 'trade_date'
  | 'ts_code'
  | 'name'
  | 'close'
  | 'pct_change'
  | 'turnover_rate'
  | 'amount'
  | 'l_sell'
  | 'l_buy'
  | 'l_amount'
  | 'net_amount'
  | 'net_rate'
  | 'amount_rate'
  | 'float_values'
  | 'reason';

export const getTopList = async (
  token: string,
  params?: TopListParams,
  fields?: TopListField[] | string,
): Promise<TopListResult[]> | null => {
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
  const data = await getTopList(tushare_token, {
    trade_date: '20211026',
  });
  console.log(data);
}

// test();
