import axios from 'axios';
import { tushare_token } from '../../tushare.config';
// 接口：bak_daily
// 描述：获取备用行情，包括特定的行情指标
const api_name = 'bak_daily';

export type BakDailyParams = {
  ts_code?: string; // 股票代码
  trade_date?: string; // 交易日期（YYYYMMDD）
  start_date?: string; // 开始日期(YYYYMMDD)
  end_date?: string; // 结束日期(YYYYMMDD)
  offset?: string; // 开始行数
  limit?: string; // 最大行数
};

export type BakDailyResult = {
  ts_code?: string; // 	股票代码
  trade_date?: string; // 交易日期
  name?: string; // 股票名称
  pct_change?: number; // 涨跌幅
  close?: number; // 收盘价
  change?: number; // 涨跌额
  open?: number; // 开盘价
  high?: number; // 	最高价
  low?: number; // 最低价
  pre_close?: number; // 昨收价
  vol_ratio?: number; // 量比
  turn_over?: number; // 	换手率
  swing?: number; // 	振幅
  vol?: number; // 	成交量
  amount?: number; // 成交额
  selling?: number; // 内盘（主动卖，手）
  buying?: number; // 	外盘（主动买， 手）
  total_share?: number; // 	总股本(万)
  float_share?: number; // 流通股本(万)
  pe?: number; // 市盈(动)
  industry?: string; // 流通市值
  area?: string; // 总市值
  float_mv?: number; // 流通市值
  total_mv?: number; // 总市值
  avg_price?: number; // 平均价
  strength?: number; // 强弱度(%)
  activity?: number; // 活跃度(%)
  avg_turnover?: number; // 笔换手
  attack?: number; // 	攻击波(%)
  interval_3?: number; // 近3月涨幅
  interval_6?: number; // 	近6月涨幅
};

export type BakDailyField =
  | 'ts_code'
  | 'trade_date'
  | 'name'
  | 'pct_change'
  | 'close'
  | 'change'
  | 'open'
  | 'high'
  | 'low'
  | 'pre_close'
  | 'vol_ratio'
  | 'turn_over'
  | 'swing'
  | 'vol'
  | 'amount'
  | 'selling'
  | 'buying'
  | 'total_share'
  | 'float_share'
  | 'pe'
  | 'industry'
  | 'area'
  | 'float_mv'
  | 'total_mv'
  | 'avg_price'
  | 'strength'
  | 'activity'
  | 'avg_turnover'
  | 'attack'
  | 'interval_3'
  | 'interval_6';

export const getBakDaily = async (
  token: string,
  params?: BakDailyParams,
  fields?: BakDailyField[] | string,
): Promise<BakDailyResult[]> | null => {
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
  const data = await getBakDaily(tushare_token, {
    ts_code: '600132.SH',
    start_date: '20211001',
  });
  console.log(data);
}

// test();
