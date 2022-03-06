import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：margin_detail
描述：获取沪深两市每日融资融券明细
*/
const api_name = 'margin_detail';
export type MarginDetailParams = {
  trade_date?: string; // 交易日期
  ts_code?: string; // TS代码
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type MarginDetailResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // TS股票代码
  name?: string; // 股票名称 （20190910后有数据）
  rzye?: number; // 融资余额(元)
  rqye?: number; // 融券余额(元)
  rzmre?: number; // 融资买入额(元)
  rqyl?: number; // 融券余量（手）
  rzche?: number; // 融资偿还额(元)
  rqchl?: number; // 融券偿还量(手)
  rqmcl?: number; // 融券卖出量(股,份,手)
  rzrqye?: number; // 融资融券余额(元)
};
export type MarginDetailField =
  | 'trade_date'
  | 'ts_code'
  | 'name'
  | 'rzye'
  | 'rqye'
  | 'rzmre'
  | 'rqyl'
  | 'rzche'
  | 'rqchl'
  | 'rqmcl'
  | 'rzrqye';

export const getMarginDetail = async (
  token: string,
  params?: MarginDetailParams,
  fields?: MarginDetailField[] | string,
): Promise<MarginDetailResult[]> | null => {
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
  const data = await getMarginDetail(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
