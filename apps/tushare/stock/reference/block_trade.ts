import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：block_trade
描述：大宗交易
限量：单次最大1000条，总量不限制
*/
const api_name = 'block_trade';
export type BlockTradeParams = {
  ts_code?: string; // TS代码（股票代码和日期至少输入一个参数）
  trade_date?: string; // 交易日期（格式：YYYYMMDD，下同）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type BlockTradeResult = {
  ts_code?: string; // TS代码
  trade_date?: string; // 交易日历
  price?: number; // 成交价
  vol?: number; // 成交量（万股）
  amount?: number; // 成交金额
  buyer?: string; // 买方营业部
  seller?: string; // 卖方营业部
};
export type BlockTradeField =
  | 'ts_code'
  | 'trade_date'
  | 'price'
  | 'vol'
  | 'amount'
  | 'buyer'
  | 'seller';

export const getBlockTrade = async (
  token: string,
  params?: BlockTradeParams,
  fields?: BlockTradeField[] | string,
): Promise<BlockTradeResult[]> | null => {
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
  const data = await getBlockTrade(tushare_token, {
    ts_code: '600132.SH',
  });
  console.log(data);
}

// test();
