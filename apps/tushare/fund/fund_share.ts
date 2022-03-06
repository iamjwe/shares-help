import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：fund_share，可以通过数据工具调试和查看数据。
描述：获取基金规模数据，包含上海和深圳ETF基金
限量：单次最大提取2000行数据
*/
const api_name = 'fund_share';
export type FundShareParams = {
  ts_code?: string; // TS基金代码
  trade_date?: string; // 交易日期
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  fund_type?: string; // 基金类型，见下表
  market?: string; // 市场：SH/SZ
};
export type FundShareResult = {
  ts_code?: string; // 基金代码，支持多只基金同时提取，用逗号分隔
  trade_date?: string; // 交易（变动）日期，格式YYYYMMDD
  fd_share?: number; // 基金份额（万）
};
export type FundShareField = 'ts_code' | 'trade_date' | 'fd_share';

export const getFundShare = async (
  token: string,
  params?: FundShareParams,
  fields?: FundShareField[] | string,
): Promise<FundShareResult[]> | null => {
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
  const data = await getFundShare(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data[0], data.length);
}

// test();
