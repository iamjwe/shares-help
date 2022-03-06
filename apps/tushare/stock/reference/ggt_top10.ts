import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：ggt_top10
描述：获取港股通每日成交数据，其中包括沪市、深市详细数据
*/
const api_name = 'ggt_top10';
export type GgtTop10Params = {
  ts_code?: string; // 股票代码（二选一）
  trade_date?: string; // 交易日期（二选一）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  market_type?: string; // 市场类型 2：港股通（沪） 4：港股通（深）
};
export type GgtTop10Result = {
  trade_date?: string; // 交易日期
  ts_code?: string; // 股票代码
  name?: string; // 股票名称
  close?: number; // 收盘价
  p_change?: number; // 涨跌幅
  rank?: string; // 资金排名
  market_type?: string; // 市场类型 2：港股通（沪） 4：港股通（深）
  amount?: number; // 累计成交金额（元）
  net_amount?: number; // 净买入金额（元）
  sh_amount?: number; // 沪市成交金额（元）
  sh_net_amount?: number; // 沪市净买入金额（元）
  sh_buy?: number; // 沪市买入金额（元）
  sh_sell?: number; // 沪市卖出金额
  sz_amount?: number; // 深市成交金额（元）
  sz_net_amount?: number; // 深市净买入金额（元）
  sz_buy?: number; // 深市买入金额（元）
  sz_sell?: number; // 深市卖出金额（元）
};
export type GgtTop10Field =
  | 'trade_date'
  | 'ts_code'
  | 'name'
  | 'close'
  | 'p_change'
  | 'rank'
  | 'market_type'
  | 'amount'
  | 'net_amount'
  | 'sh_amount'
  | 'sh_net_amount'
  | 'sh_buy'
  | 'sh_sell'
  | 'sz_amount'
  | 'sz_net_amount'
  | 'sz_buy'
  | 'sz_sell';

export const getGgtTop10 = async (
  token: string,
  params?: GgtTop10Params,
  fields?: GgtTop10Field[] | string,
): Promise<GgtTop10Result[]> | null => {
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
  const data = await getGgtTop10(tushare_token, {
    trade_date: '20211026',
  });
  console.log(data);
}

// test();
