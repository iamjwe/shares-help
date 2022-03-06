import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：stk_limit
// 描述：获取全市场（包含A/B股和基金）每日涨跌停价格，包括涨停价格，跌停价格等，每个交易日8点40左右更新当日股票涨跌停价格。
const api_name = 'stk_limit';

export type StkLimitParams = {
  ts_code: string; // 	股票代码
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type StkLimitResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // TS股票代码
  pre_close?: number; // 昨日收盘价
  up_limit?: number; // 涨停价
  down_limit?: number; // 跌停价
};

export type StkLimitField = 'ts_code' | 'trade_date' | 'adj_factor	';

export const getStkLimit = async (
  token: string,
  params?: StkLimitParams,
  fields?: StkLimitField[] | string,
): Promise<StkLimitResult[]> | null => {
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
  const data = await getStkLimit(tushare_token, {
    ts_code: '600132.SH',
    start_date: '20211001',
  });
  console.log(data);
}

// test();
