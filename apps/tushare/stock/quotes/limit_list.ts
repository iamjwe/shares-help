import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：limit_list，可以通过数据工具调试和查看数据。
// 描述：获取每日涨跌停股票统计，包括封闭时间和打开次数等数据，帮助用户快速定位近期强（弱）势股，以及研究超短线策略。
const api_name = 'limit_list';

export type LimitListParams = {
  trade_date?: string; // 交易日期 YYYYMMDD格式，支持单个或多日期输入
  ts_code?: string; // 股票代码 （支持单个或多个股票输入）
  limit_type?: string; // 涨跌停类型：U涨停D跌停
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 结束日期(YYYYMMDD)
};

export type LimitListResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // 股票代码
  name?: number; // 	股票名称
  close?: number; // 收盘价
  pct_chg?: number; // 涨跌幅
  amp?: number; // 振幅
  fc_ratio?: number; // 封单金额/日成交金额
  fl_ratio?: number; // 	封单手数/流通股本
  fd_amount?: number; // 封单金额
  first_time?: number; // 首次涨停时间
  last_time?: number; // 最后封板时间
  open_times?: number; // 打开次数
  strth?: number; // 涨跌停强度
  limit?: number; // D跌停U涨停
};

export type LimitListField =
  | 'trade_date'
  | 'ts_code'
  | 'name'
  | 'close'
  | 'pct_chg'
  | 'amp'
  | 'fc_ratio'
  | 'fl_ratio'
  | 'fd_amount'
  | 'first_time'
  | 'last_time'
  | 'open_times'
  | 'strth'
  | 'limit';

export const getLimitList = async (
  token: string,
  params?: LimitListParams,
  fields?: LimitListField[] | string,
): Promise<LimitListResult[]> | null => {
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
  const data = await getLimitList(tushare_token, {
    ts_code: '600132.SH',
    start_date: '20210101',
  });
  console.log(data);
}

// test();
