import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_adj
描述：获取基金复权因子，用于计算基金复权行情
限量：单次最大提取2000行记录，可循环提取，数据总量不限制
*/
const api_name = 'fund_adj';
export type FundAdjParams = {
  ts_code?: string; // TS基金代码（支持多只基金输入）
  trade_date?: string; // 交易日期（格式：yyyymmdd，下同）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  offset?: string; // 开始行数
  limit?: string; // 最大行数
};
export type FundAdjResult = {
  ts_code?: string; // ts基金代码
  trade_date?: string; // 交易日期
  adj_factor?: number; // 复权因子
};
export type FundAdjField = 'ts_code' | 'trade_date' | 'adj_factor';

export const getFundAdj = async (
  token: string,
  params?: FundAdjParams,
  fields?: FundAdjField[] | string,
): Promise<FundAdjResult[]> | null => {
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
  const data = await getFundAdj(tushare_token, {
    trade_date: '20210507',
  });
  console.log(data);
}

// test();
