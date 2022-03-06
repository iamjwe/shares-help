import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：stock_basic
// 描述：获取基础信息数据，包括股票代码、名称、上市日期、退市日期等
const api_name = 'stock_basic';

export type StockBasicParams = {
  is_hs?: string; // 	是否沪深港通标的，N否 H沪股通 S深股通
  list_status?: string; // 上市状态 L上市 D退市 P暂停上市，默认是L
  exchange?: string; // 交易所 SSE上交所 SZSE深交所
  ts_code?: string; // TS股票代码
  market?: string; // 市场类别（主板/创业板/科创板/CDR）
  limit?: number;
  offset?: number;
  name?: string; // 名称
};

export type StockBasicResult = {
  ts_code?: string; // TS代码
  symbol?: string; // 股票代码
  name?: string; // 股票名称
  area?: string; // 地域
  industry?: string; // 所属行业
  fullname?: string; // 股票全称
  enname?: string; // 英文全称
  cnspell?: string; // 拼音缩写
  market?: string; // 	市场类型（主板/创业板/科创板/CDR）
  exchange?: string; // 交易所代码
  curr_type?: string; // 交易货币
  list_status?: string; // 上市状态 L上市 D退市 P暂停上市
  list_date?: string; // 	上市日期
  delist_date?: string; // 退市日期
  is_hs?: string; // 	是否沪深港通标的，N否 H沪股通 S深股通
};

export type StockBasicField =
  | 'ts_code'
  | 'symbol'
  | 'name'
  | 'area'
  | 'industry'
  | 'fullname'
  | 'enname'
  | 'cnspell'
  | 'market'
  | 'exchange'
  | 'exchange'
  | 'curr_type'
  | 'list_status'
  | 'list_date'
  | 'delist_date'
  | 'is_hs';

export const getStockBasic = async (
  token: string,
  params?: StockBasicParams,
  fields?: StockBasicField[] | string,
): Promise<StockBasicResult[]> | null => {
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
  const data = await getStockBasic(tushare_token, {
    limit: 10,
  });
  console.log(data);
}

// test();
