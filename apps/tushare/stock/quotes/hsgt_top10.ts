import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：hsgt_top10
// 描述：获取沪股通、深股通每日前十大成交详细数据
const api_name = 'hsgt_top10';

export type HsgtTop10Params = {
  ts_code?: string; // 股票代码（二选一）
  trade_date?: string; // 交易日期（二选一）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 结束日期(YYYYMMDD)
  market_type?: string; // 市场类型（1：沪市 3：深市）
};

export type HsgtTop10Result = {
  trade_date?: string; // 交易日期
  ts_code?: string; // 股票代码
  name?: string; // 股票名称
  close?: number; // 收盘价
  change?: number; // 涨跌额
  rank?: number; // 资金排名
  market_type?: string; // 市场类型（1：沪市 3：深市）
  amount?: number; // 成交金额（元））
  net_amount?: number; // 净成交金额（元）
  buy?: number; // 	买入金额（元）
  sell?: number; // 卖出金额（元）
};

export type MoneyflowHsgtField =
  | 'trade_date'
  | 'ts_code'
  | 'name	'
  | 'close'
  | 'change'
  | 'rank'
  | 'market_type'
  | 'amount'
  | 'net_amount'
  | 'buy'
  | 'sell';

export const getMoneyflowHsgt = async (
  token: string,
  params?: HsgtTop10Params,
  fields?: MoneyflowHsgtField[] | string,
): Promise<HsgtTop10Result[]> | null => {
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
  const data = await getMoneyflowHsgt(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
