import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：top_inst
描述：龙虎榜机构成交明细
*/
const api_name = 'top_inst';
export type TopInstParams = {
  trade_date: string; // 交易日期
  ts_code?: string; // TS代码
};
export type TopInstResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // TS代码
  exalter?: string; // 营业部名称
  side?: string; // 买卖类型0：买入金额最大的前5名， 1：卖出金额最大的前5名
  buy?: number; // 买入额（元）
  buy_rate?: number; // 买入占总成交比例
  sell?: number; // 卖出额（元）
  sell_rate?: number; // 卖出占总成交比例
  net_buy?: number; // 净成交额（元）
  reason?: string; // 上榜理由
};
export type TopInstField =
  | 'trade_date'
  | 'ts_code'
  | 'exalter'
  | 'side'
  | 'buy'
  | 'buy_rate'
  | 'sell'
  | 'sell_rate'
  | 'net_buy'
  | 'reason';

export const getTopInst = async (
  token: string,
  params?: TopInstParams,
  fields?: TopInstField[] | string,
): Promise<TopInstResult[]> | null => {
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
  const data = await getTopInst(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
