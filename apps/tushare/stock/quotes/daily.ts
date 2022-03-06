import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：daily，可以通过数据工具调试和查看数据。
// 数据说明：交易日每天15点～16点之间。本接口是未复权行情，停牌期间不提供数据。
// 描述：获取股票行情数据，或通过通用行情接口获取数据，包含了前后复权数据。
const api_name = 'daily';

export type DailyParams = {
  ts_code?: string; // 	股票代码（支持多个股票同时提取，逗号分隔）
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 	结束日期(YYYYMMDD)
};

export type DailyResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 	交易日期
  open?: number; // 开盘价
  high?: number; // 最高价
  low?: number; // 最低价
  close?: number; // 	收盘价
  pre_close?: number; // 昨收价
  change?: number; // 	涨跌额
  pct_chg?: number; // 涨跌幅 （未复权，如果是复权请用 通用行情接口 ）
  vol?: number; // 成交量 （手）
  amount?: number; // 成交额 （千元）
};

export type HsConstField =
  | 'ts_code'
  | 'trade_date'
  | 'open	'
  | 'high'
  | 'low'
  | 'close'
  | 'pre_close'
  | 'change'
  | 'pct_chg'
  | 'vol'
  | 'amount';

export const getDaily = async (
  token: string,
  params?: DailyParams,
  fields?: HsConstField[] | string,
): Promise<DailyResult[]> | null => {
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
      // console.log('reqBody', reqBody);
      // console.log(error);
      result = null;
    });
  return result;
};

async function test() {
  const data = await getDaily(tushare_token, {
    ts_code: '600132.SH',
    trade_date: '20211027',
  });
  console.log(data);
}

// test();
