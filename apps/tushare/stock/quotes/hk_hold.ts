import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：hk_hold，可以通过数据工具调试和查看数据。
// 描述：获取沪深港股通持股明细，数据来源港交所。
const api_name = 'hk_hold';

export type HkHoldParams = {
  code?: string; // 交易所代码
  ts_code?: string; // 股票代码
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 结束日期(YYYYMMDD)
  exchange?: string; // 类型：SH沪股通（北向）SZ深股通（北向）HK港股通（南向持股）
};

export type HKHoldResult = {
  code?: string; // 原始代码
  trade_date?: string; // 交易日期
  ts_code?: string; // 	股票代码
  name?: string; // 股票名称
  vol?: number; // 持股数量(股)
  ratio?: number; // 持股占比（%），占已发行股份百分比
  exchange?: number; // 类型：SH沪股通SZ深股通HK港股通
};

export type HkHoldField =
  | 'code'
  | 'ts_code'
  | 'trade_date'
  | 'name	'
  | 'vol'
  | 'ratio'
  | 'exchange';

export const getHkHold = async (
  token: string,
  params?: HkHoldParams,
  fields?: HkHoldField[] | string,
): Promise<HKHoldResult[]> | null => {
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
  const data = await getHkHold(tushare_token, {
    ts_code: '600132.SH',
    start_date: '20211001',
  });
  console.log(data);
}

// test();
