import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：sz_daily_info
描述：获取深圳市场每日交易概况
限量：单次最大2000，可循环获取，总量不限制
*/
const api_name = 'sz_daily_info';
export type SzDailyInfoParams = {
  trade_date?: string; // 交易日期（YYYYMMDD格式，下同）
  ts_code?: string; // 板块代码
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type SzDailyInfoResult = {
  trade_date?: string; //
  ts_code?: string; // 市场类型
  count?: number; // 股票个数
  amount?: number; // 成交金额
  vol?: number; // 成交量
  total_share?: number; // 总股本
  total_mv?: number; // 总市值
  float_share?: number; // 流通股票
  float_mv?: number; // 流通市值
};
export type SzDailyInfoField =
  | 'trade_date'
  | 'ts_code'
  | 'count'
  | 'amount'
  | 'vol'
  | 'total_share'
  | 'total_mv'
  | 'float_share'
  | 'float_mv';

export const getSzDailyInfo = async (
  token: string,
  params?: SzDailyInfoParams,
  fields?: SzDailyInfoField[] | string,
): Promise<SzDailyInfoResult[]> | null => {
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
  const data = await getSzDailyInfo(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
