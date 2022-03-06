import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：index_dailybasic
描述：目前只提供上证综指，深证成指，上证50，中证500，中小板指，创业板指的每日指标数据
数据来源：Tushare社区统计计算
数据历史：从2004年1月开始提供
*/
const api_name = 'index_dailybasic';
export type IndexDailybasicParams = {
  trade_date?: string; // 交易日期 （格式：YYYYMMDD，比如20181018，下同）
  ts_code?: string; // TS代码
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type IndexDailybasicResult = {
  ts_code?: string; // TS代码
  trade_date?: string; // 交易日期
  total_mv?: number; // 当日总市值（元）
  float_mv?: number; // 当日流通市值（元）
  total_share?: number; // 当日总股本（股）
  float_share?: number; // 当日流通股本（股）
  free_share?: number; // 当日自由流通股本（股）
  turnover_rate?: number; // 换手率
  turnover_rate_f?: number; // 换手率(基于自由流通股本)
  pe?: number; // 市盈率
  pe_ttm?: number; // 市盈率TTM
  pb?: number; // 市净率
};
export type IndexDailybasicField =
  | 'ts_code'
  | 'trade_date'
  | 'total_mv'
  | 'float_mv'
  | 'total_share'
  | 'float_share'
  | 'free_share'
  | 'turnover_rate'
  | 'turnover_rate_f'
  | 'pe'
  | 'pe_ttm'
  | 'pb';

export const getIndexDailybasic = async (
  token: string,
  params?: IndexDailybasicParams,
  fields?: IndexDailybasicField[] | string,
): Promise<IndexDailybasicResult[]> | null => {
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
  const data = await getIndexDailybasic(tushare_token, {
    ts_code: '399300.SZ',
  });
  console.log(data);
}

// test();
