import axios from 'axios';
import { tushare_token } from '../../tushare.config';
/*
接口：margin
描述：获取融资融券每日交易汇总数据
*/
const api_name = 'margin';
export type MarginParams = {
  trade_date?: string; // 交易日期
  exchange_id?: string; // 交易所代码
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
};
export type MarginResult = {
  trade_date?: string; // 交易日期
  exchange_id?: string; // 交易所代码（SSE上交所SZSE深交所）
  rzye?: number; // 融资余额(元)
  rzmre?: number; // 融资买入额(元)
  rzche?: number; // 融资偿还额(元)
  rqye?: number; // 融券余额(元)
  rqmcl?: number; // 融券卖出量(股,份,手)
  rzrqye?: number; // 融资融券余额(元)
  rqyl?: number; // 融券余量(股,份,手)
};
export type MarginField =
  | 'trade_date'
  | 'exchange_id'
  | 'rzye'
  | 'rzmre'
  | 'rzche'
  | 'rqye'
  | 'rqmcl'
  | 'rzrqye'
  | 'rqyl';

export const getMargin = async (
  token: string,
  params?: MarginParams,
  fields?: MarginField[] | string,
): Promise<MarginResult[]> | null => {
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
  const data = await getMargin(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
