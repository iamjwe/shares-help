import axios from 'axios';
import { tushare_token } from '../tushare.config';
/*
接口：daily_info
描述：获取交易所股票交易统计，包括各板块明细
限量：单次最大4000，可循环获取，总量不限制
*/
const api_name = 'daily_info';
export type DailyInfoParams = {
  trade_date?: string; // 交易日期（YYYYMMDD格式，下同）
  ts_code?: string; // 板块代码（请参阅下方列表）
  exchange?: string; // 股票市场（SH上交所 SZ深交所）
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  fields?: string; // 指定提取字段
};
export type DailyInfoResult = {
  trade_date?: string; // 交易日期
  ts_code?: string; // 市场代码
  ts_name?: string; // 市场名称
  com_count?: number; // 挂牌数
  total_share?: number; // 总股本（亿股）
  float_share?: number; // 流通股本（亿股）
  total_mv?: number; // 总市值（亿元）
  float_mv?: number; // 流通市值（亿元）
  amount?: number; // 交易金额（亿元）
  vol?: number; // 成交量（亿股）
  trans_count?: number; // 成交笔数（万笔）
  pe?: number; // 平均市盈率
  tr?: number; // 换手率（％），注：深交所暂无此列
  exchange?: string; // 交易所（SH上交所 SZ深交所）
};
export type DailyInfoField =
  | 'trade_date'
  | 'ts_code'
  | 'ts_name'
  | 'com_count'
  | 'total_share'
  | 'float_share'
  | 'total_mv'
  | 'float_mv'
  | 'amount'
  | 'vol'
  | 'trans_count'
  | 'pe'
  | 'tr'
  | 'exchange';

export const getDailyInfo = async (
  token: string,
  params?: DailyInfoParams,
  fields?: DailyInfoField[] | string,
): Promise<DailyInfoResult[]> | null => {
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
  const data = await getDailyInfo(tushare_token, {
    trade_date: '20211015',
  });
  console.log(data);
}

// test();
